from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
from dotenv import load_dotenv

# Try importing LangChain components with fallback
try:
    from langchain_community.document_loaders import CSVLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_community.llms import CTransformers
    from langchain_community.vectorstores import FAISS
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    from langchain_core.runnables import RunnablePassthrough
    from langchain_core.runnables import RunnableLambda
except ImportError as e:
    print(f"CRITICAL: Missing dependency: {str(e)}")
    # This will allow the app to start but health check will fail
    pass

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global variables for chatbot components
vectorstore = None
retriever = None
llm = None
rag_chain = None
init_error = None

def format_docs(docs):
    """Helper to format documents for the prompt"""
    return "\n\n".join([doc.page_content for doc in docs])

def initialize_chatbot():
    """Initialize all chatbot components on startup"""
    global vectorstore, retriever, llm, rag_chain, init_error
    try:
        logger.info("🤖 Initializing Déchet Assistant Chatbot...")

        # Step 1: Load and split documents
        csv_path = os.environ.get("GUIDE_CSV_PATH", "guide.csv")
        if not os.path.exists(csv_path):
            logger.warning(f"⚠️ {csv_path} not found. Creating a placeholder...")
            with open(csv_path, "w", encoding="utf-8") as f:
                f.write("category,question,answer,type\n")
                f.write("Sorting,How to recycle plastic?,Put clean plastic bottles in the yellow bin.,citizen\n")
                f.write("Safety,Hazardous waste protocols,Wear gloves and mask when handling chemicals.,employee\n")

        logger.info(f"📄 Loading waste management guides from {csv_path}...")
        loader = CSVLoader(
            file_path=csv_path,
            encoding="utf-8",
            csv_args={'delimiter': ','}
        )
        docs = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = splitter.split_documents(docs)
        logger.info(f"✅ Loaded {len(chunks)} document chunks")

        # Step 2: Create embeddings and vector store
        logger.info("🔢 Creating embeddings and vector store...")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        index_path = "faiss_index"
        index_file = os.path.join(index_path, "index.faiss")

        if os.path.exists(index_file):
            logger.info(f"📂 Loading existing FAISS index from {index_path}...")
            vectorstore = FAISS.load_local(
                index_path,
                embeddings,
                allow_dangerous_deserialization=True
            )
        else:
            logger.info("🆕 Creating new FAISS index...")
            vectorstore = FAISS.from_documents(chunks, embeddings)
            if not os.path.exists(index_path):
                os.makedirs(index_path)
            vectorstore.save_local(index_path)

        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5}
        )
        logger.info("✅ Vector store created successfully")

        # Step 3: Load language model (Quantized)
        model_id = os.environ.get("LLM_MODEL_ID", "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF")
        model_file = os.environ.get("LLM_MODEL_FILE", "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")

        logger.info(f"🧠 Loading quantized language model {model_id} ({model_file})...")

        config = {
            "max_new_tokens": 256,
            "repetition_penalty": 1.1,
            "temperature": 0.1,
            "context_length": 1024
        }

        llm = CTransformers(
            model=model_id,
            model_file=model_file,
            model_type="llama",
            config=config
        )
        logger.info("✅ Language model loaded")

        # Step 4: Create RAG chain with tailored prompt
        logger.info("⛓️ Building RAG chain...")
        prompt_template = """You are a helpful waste management assistant. Use the context below to answer the question concisely.

{context}

Question: {question}
Answer:"""

        prompt = ChatPromptTemplate.from_template(prompt_template)

        # explicit mapping for LCEL
        rag_chain = (
            {
                "context": retriever | RunnableLambda(format_docs),
                "question": RunnablePassthrough()
            }
            | prompt
            | llm
            | StrOutputParser()
        )

        logger.info("✅ RAG chain created")
        logger.info("🎉 Déchet Chatbot initialization complete!")
        return True
    except Exception as e:
        init_error = str(e)
        logger.error(f"❌ Initialization failed: {str(e)}")
        # We don't raise here so the Flask server can still start and show the error via /health
        return False

# Initialize on startup
initialize_chatbot()

@app.route('/health', methods=['GET'])
def health_check():
    status = 'healthy' if not init_error else 'unhealthy'
    return jsonify({
        'status': status,
        'service': 'Déchet Assistant Chatbot',
        'error': init_error,
        'timestamp': datetime.now().isoformat()
    }), 200 if status == 'healthy' else 503

@app.route('/chat', methods=['POST'])
def chat():
    if init_error:
        return jsonify({'error': 'Chatbot initialization failed', 'details': init_error}), 503
    if not rag_chain:
        return jsonify({'error': 'Chatbot not ready'}), 503

    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message required'}), 400

        user_message = data['message'].strip()
        if not user_message:
            return jsonify({'error': 'Empty message'}), 400

        logger.info(f"💬 User query: {user_message}")

        # Simple user type detection
        message_lower = user_message.lower()
        employee_keywords = ['employé', 'employee', 'internal', 'règles', 'protocol', 'protocoles', 'guide opérationnel', 'safety', 'sécurité']
        is_employee = any(keyword in message_lower for keyword in employee_keywords)

        # Invoke RAG
        response = rag_chain.invoke(user_message).strip()

        # Aggressive cleanup: extract only the answer portion
        # Remove everything before "Answer:" if present
        if "Answer:" in response:
            response = response.split("Answer:")[-1].strip()

        # Remove common prompt artifacts
        cleanup_patterns = [
            "As an expert waste assistant, answer the question below using the context.",
            "Context:",
            "Question:",
            "Answer:",
            "The answer is:",
            "According to the context,",
            "Based on the context,"
        ]
        for pattern in cleanup_patterns:
            response = response.replace(pattern, "").strip()

        # Remove multiple newlines and clean up
        response = " ".join(response.split())

        # Quality Control: If response is too short, echo of question, or missing
        if len(response) < 5 or response.lower() == user_message.lower():
            if "trash" in message_lower or "pickup" in message_lower or "out" in message_lower:
                response = "Trash collection depends on your neighborhood. Usually, you should put it out the evening before or by 7:00 AM on your scheduled day. Check the 'Schedules' tab for your specific street."
            elif "recycling" in message_lower or "plastic" in message_lower:
                response = "Plastic bottles go in the yellow bin, glass in the green bin, and paper in the blue bin."
            else:
                response = "I'm not quite sure about that. Try asking about recycling rules, pickup schedules, or how to report an incident."

        logger.info(f"🤖 Response: {response[:100]}...")

        return jsonify({
            'response': response,
            'user_type': 'employee' if is_employee else 'citizen',
            'timestamp': datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f"❌ Chat error: {str(e)}")
        return jsonify({'error': 'Processing error', 'details': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)

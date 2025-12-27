# Déchet Assistant Chatbot 🤖

A RAG-based chatbot for waste management assistance using LangChain and Hugging Face models.

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Run the Chatbot

```bash
# Build and start the chatbot
docker-compose up -d

# View logs
docker-compose logs -f chatbot

# Stop the chatbot
docker-compose down
```

The chatbot will be available at `http://localhost:5001`

### Health Check
```bash
curl http://localhost:5001/health
```

### Test the Chatbot
```bash
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I recycle plastic?"}'
```

## 🛠️ Local Development

### Prerequisites
- Python 3.10+
- uv (recommended) or pip

### Setup

```bash
# Install dependencies
uv pip install -r requirements.txt

# Run the chatbot
python app.py
```

## 📝 Configuration

### Environment Variables

- `PORT`: Server port (default: 5001)
- `GUIDE_CSV_PATH`: Path to the guide CSV file (default: guide.csv)
- `LLM_MODEL_ID`: Hugging Face model ID (default: TinyLlama/TinyLlama-1.1B-Chat-v1.0)

### Model Options

The chatbot uses **TinyLlama 1.1B** by default for fast, production-ready performance. You can change the model by setting the `LLM_MODEL_ID` environment variable:

**Small & Fast (Production)**
- `TinyLlama/TinyLlama-1.1B-Chat-v1.0` (default) - Best for production
- `microsoft/Phi-3-mini-4k-instruct` - Alternative small model

**Better Performance (Requires more resources)**
- `Qwen/Qwen2.5-7B-Instruct` - Excellent for RAG tasks
- `mistralai/Mistral-7B-Instruct-v0.3` - Strong multilingual support

**Note**: Larger models (7B+) require significantly more RAM and longer startup times.

## 📊 API Endpoints

### `GET /health`
Check chatbot health status

### `POST /chat`
Send a message to the chatbot

**Request Body:**
```json
{
  "message": "How do I recycle plastic?"
}
```

**Response:**
```json
{
  "response": "Put clean plastic bottles in the yellow bin.",
  "user_type": "citizen",
  "timestamp": "2025-12-26T20:00:00"
}
```

## 📁 Project Structure

```
chatbot/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── guide.csv          # Waste management knowledge base
└── faiss_index/       # Vector store (auto-generated)
```

## 🔧 Updating the Knowledge Base

Edit `guide.csv` with your waste management Q&A data. The chatbot will automatically rebuild the vector index on startup.

**CSV Format:**
```csv
category,question,answer,type
Sorting,How to recycle plastic?,Put clean plastic bottles in the yellow bin.,citizen
Safety,Hazardous waste protocols,Wear gloves and mask when handling chemicals.,employee
```

## 🐳 Docker Details

- **Base Image**: Python 3.10 slim
- **Port**: 5001
- **Volumes**:
  - `./faiss_index` - Persists vector store
  - `./guide.csv` - Easy knowledge base updates
- **Health Check**: Automatic health monitoring
- **Restart Policy**: Unless stopped manually

## 📈 Performance

- **Startup Time**: ~30-60 seconds (first run downloads model)
- **Response Time**: ~1-3 seconds per query
- **Memory Usage**: ~2-3 GB RAM (with TinyLlama)

## 🔒 Production Considerations

1. **Use a production WSGI server** (e.g., Gunicorn) instead of Flask's dev server
2. **Set up proper logging** and monitoring
3. **Configure resource limits** in docker-compose.yml
4. **Use environment-specific configs** for different deployments
5. **Implement rate limiting** for the API endpoints

## 📄 License

Part of the Projet Déchet waste management system.

FROM node:25-alpine AS build

ARG API_URL='http://localhost:8082/api'
ARG KEYCLOAK_URL='http://localhost:8080'
ARG KEYCLOAK_REALM='dechetrealm'
ARG KEYCLOAK_CLIENT_ID='dechet-frontend'
ENV  API_URL=${API_URL}
ENV ENVIRONMENT=${ENVIRONMENT}
ENV KEYCLOAK_REALM=${KEYCLOAK_REALM}
ENV KEYCLOAK_CLIENT_ID=${KEYCLOAK_CLIENT_ID}
WORKDIR /build 
COPY package*.json .
RUN npm install --force 
COPY . .
RUN npm run build 


FROM nginx AS runtime 
WORKDIR /usr/share/nginx/html
COPY --from=build /build/dist/frontend/browser .
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
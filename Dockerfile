FROM node:20-alpine3.18 as builder

WORKDIR /app

COPY package*.json .

RUN yarn install

COPY . .

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "-c", "yarn run start:dev"]

ENV OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
ENV OPENAI_MODEL_NAME=${{ secrets.OPENAI_MODEL_NAME }}
ENV JWT_SECRET=${{ secrets.JWT_SECRET }}
ENV PINECONE_API_KEY=${{ secrets.PINECONE_API_KEY }}
ENV PINECONE_ENVIRONMENT=${{ secrets.PINECONE_ENVIRONMENT }}

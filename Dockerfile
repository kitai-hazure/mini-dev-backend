FROM node:20-alpine3.18 as builder

WORKDIR /app

COPY package*.json .

RUN yarn install

COPY . .

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "-c", "yarn run start:dev"]

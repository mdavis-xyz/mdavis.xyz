FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY Readability.js ./
COPY index.js ./
COPY JSDOMParser.js ./
RUN npm install
COPY index.html ./
COPY matt.js ./
RUN node matt.js

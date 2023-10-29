FROM node

WORKDIR /app

COPY . .

COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
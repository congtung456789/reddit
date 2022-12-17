FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN rm -rf node_modules
RUN rm -f package-lock.json
RUN npm cache clean --force
RUN npm install
COPY . .
EXPOSE 8088
CMD [ "node","index.js" ]

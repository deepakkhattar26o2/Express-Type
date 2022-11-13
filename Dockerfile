FROM node:16

RUN mkdir -p /opt/app

WORKDIR /app

COPY . .

RUN npm install --production

EXPOSE 5000

CMD npm run serve
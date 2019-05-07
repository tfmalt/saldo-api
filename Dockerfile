FROM node:lts
LABEL maintainer="thomas@malt.no"

USER node
WORKDIR /usr/src/saldo
COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD [npm, start]

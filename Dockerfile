FROM node:16
LABEL maintainer="thomas@malt.no"

# USER node
WORKDIR /usr/src/saldo
COPY package.json .

RUN npm install
ADD . /usr/src/saldo
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

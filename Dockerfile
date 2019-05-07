FROM node:11
LABEL maintainer="thomas@malt.no"

# USER node
WORKDIR /usr/src/saldo
COPY . /usr/src/saldo

RUN npm install
# RUN chown -R node /usr/src/saldo

EXPOSE 3000

CMD ["npm", "start"]

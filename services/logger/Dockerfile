FROM node:8

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# this will be cached
ADD package.json /usr/src/app/package.json
RUN npm install

ADD . /usr/src/app
RUN npm run build

CMD [ "node", "dist/index.js" ]

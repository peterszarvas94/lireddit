FROM node:19

WORKDIR /usr/src/app

RUN npm install -g typescript

COPY package.json /
COPY yarn.lock /

RUN yarn

COPY . .
COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node
FROM node:10

WORKDIR /usr/src/app

COPY application/package.json ./
COPY application/yarn.lock ./

RUN yarn install --ignore-engines

COPY application .

RUN yarn build

EXPOSE 3000
CMD [ "yarn", "start:prod" ]

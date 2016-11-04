FROM node:6.9.1
MAINTAINER Thymeflow team

RUN mkdir -p /app
WORKDIR /app

COPY package.json ./package.json
RUN npm -q install

COPY . /app

RUN npm -q install -g phantomjs bower ember-cli@2.7.0 ;\
  bower --allow-root install

EXPOSE 4200
EXPOSE 49152

CMD [ "ember", "server" ]

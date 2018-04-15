# Debian is used for development as this is required by PhantomJS
FROM node:6.10.2

MAINTAINER "David Montoya" <david@montoya.one>

RUN apt-get update && apt-get install -y --no-install-recommends \
      git
# Install PhantomJS
RUN npm install -q -g phantomjs-prebuilt@2.1.16
# Install Bower and Ember CLI
RUN npm install -q -g bower@1.8.0 && npm install -q -g ember-cli@2.12.3

RUN mkdir -p /app/src && chown -R node:node /app
WORKDIR /app/src

USER node

COPY --chown=node:node package.json ./package.json
RUN npm install -q

COPY --chown=node:node bower.json ./bower.json
RUN bower install

COPY --chown=node:node . .

EXPOSE 4200
EXPOSE 49152

CMD [ "ember", "server" ]

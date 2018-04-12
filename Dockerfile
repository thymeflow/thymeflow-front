FROM node:6.10.2-alpine

MAINTAINER "David Montoya" <david@montoya.one>

# Install PhantomJS
RUN npm install -g phantomjs-prebuilt
# Install Bower and Ember CLI
RUN npm install -g bower@1.8.0 && npm install -g ember-cli@2.12.3

RUN apk add --update --no-cache \
      git

RUN mkdir -p /app/src && chown -R node:node /app
WORKDIR /app/src

USER node

COPY --chown=node:node package.json ./package.json
RUN npm install

COPY --chown=node:node bower.json ./bower.json
RUN bower install

COPY --chown=node:node . .

EXPOSE 4200
EXPOSE 49152

CMD [ "ember", "server" ]

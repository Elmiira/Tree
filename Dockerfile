FROM node:12-alpine as build
# We compile typescript in first stage

# install git and node-gyp dependencies
RUN apk update && \
  apk add --no-cache make gcc g++ python git

# create tree backend directories
RUN mkdir -p /app/tree-service


RUN cd /app/tree-service 

# install backendservicepackage.json build dependencies
COPY package.json /app/tree-service/
RUN cd /app/tree-service && yarn

# compile and build project code
COPY . /app/tree-service/
RUN cd /app/tree-service && \
  yarn build

RUN cd /app/tree-service && \
  rm -rf node_modules && \
  yarn install 

#######################   Production App   ##########################
FROM node:10-alpine
# next stage: prepare production environment
ENV NODE_ENV=development
ENV PORT=10201

# Add tiny init process to wrap main app in production
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

RUN mkdir -p /app/current && \
  chown -R node:node /app

RUN mkdir -p /app/current/node_modules && \
  mkdir -p /app/current/src

COPY --chown=node:node --from=build /app/tree-service/node_modules/ /app/current/node_modules

COPY --chown=node:node --from=build /app/tree-service/dist /app/current/src

WORKDIR /app/current
USER node

EXPOSE 10201
CMD [ "node", "src/main.js" ]


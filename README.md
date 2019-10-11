## Description

This project was bootstrapped with [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Table of Contents
- [Folder Structure](#folder-structure)
- [Available Scripts](#available-scripts)
  - [Running the app with docker](#running-the-app-with-docker)
  - [Running the app locally](#running-the-app-locally)
  - [Test](#test)
- [Access Databases](#access-databases)

 

 ## Folder Structure

```
my-app/
  README.md
  node_modules/
  package.json
  Dockerfile
  docker-compose.yml
  src/
    app/
    mongo/
    sample-data/
    tree/
    config.ts
    main.ts
  test/
```

## Available Scripts

### `Running the app with docker`

Before getting started you should have the following installed on your machine:  
  - docker
  - docker-compose

Run these sequentially in the project directory:
```bash
# Build the container images 
# Watch for possible build errors if you had error you should build again  
 docker-compose build


 docker-compose up
```

### `Running the app locally`


```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```
Alternatively you may use `yarn`:

```sh
yarn add react-router
```

### Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```


## Access Databases
 
  ### Docker
  - After configuring everything `docker-compose up` runs a new mongodb container.
  - It stores database data inside a docker volume `mongodb_data`.
  - __When mongo container is running__  Mongo is exposed to port 29017  so:
    - you can restore old db files using `mongorestore -h localhost --port 29017` 
    - you can connect with an mongo IDE/GUI  [Studio 3t](https://studio3t.com) or just run
      ```bash
      $ docker exec -it tree_mongo_1 mongo --port 29017
      ```
  ### Locally
  - Mongo is exposed to port 27017
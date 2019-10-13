## Description

This project was bootstrapped with [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Table of Contents
- [Folder Structure](#folder-structure)
- [Available Scripts](#available-scripts)
  - [Running the app with docker](#running-the-app-with-docker)
  - [Running the app locally](#running-the-app-locally)
  - [Test](#test)
- [Access Databases](#access-databases)
- [Algorithm Mindset](#algorithm-mindset)


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
yarn start
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
    - you can connect with a mongo IDE/GUI like [Studio 3t](https://studio3t.com) or just run
      ```bash
      $ docker exec -it tree_mongo_1 mongo --port 29017
      ```
  ### Locally
  - Mongo is exposed to port 27017

## Algorithm Mindset
  
  The main idea was storing a data model that organizes documents in a tree-like structure; To deal this issue, there are two workload concerns:
  `-Read Intensive`
  `-Write Intensive`

  ### Read Intensive

  With this context, tree data model is implemented by storing references to “parent” nodes and an array that stores all ancestors; So with cost of memory space within a redundancy support db like mongo, this project implements a fast and efficient solution to find the descendants and the ancestors of a node.
  The appropriate services to search and change the parent node with this data model are in order:
  - `findDescendersWithReadPriority`
  - `updateDescenders`

To optimize search time, tree collection is indexed based on ancestors field.<br/>
To update subtree, this project utilizes mongo array operator like `$pull, $push, $in , ...`; Consequently instead of a loop operation and using mongo `Bulk` ops, by delegating to db and least I/Os, consistency is resolved (for real cases we could consider db clusters & Replication).

 ### Write Intensive
  A high change frequency system which aims and concerns in data consistency, maybe!!! prefers slightly simpler tree data model with cost of delegating some computations to programs to handle read requests; So __just__ to codify this idea, two methods are implemented that just use the id of the node’s parent:
  - findDescendersWithWritePriority
  - updateImmediateChildren

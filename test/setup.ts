import { Db } from 'mongodb';
import { INestApplication } from '@nestjs/common';
import { mongoConnectionToken } from './../src/mongo/constants';
import { Test, TestingModule } from '@nestjs/testing';

export let app: INestApplication;
export let db: Db;

const setup = async () => {
  const AppModule = require('../src/app/app.module').AppModule;
  jest.mock('../src/config');
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  db = await moduleFixture.get(mongoConnectionToken);
  const dbName = db.databaseName;
  if (!dbName.includes('-test-')) {
    db = undefined;
    throw Error(
      `
      test databases must include "-test-" in their names, but the given name is ${dbName}.
      db value reset to undefined to prevent accidental data loss on main database.
      `,
    );
  }
  app = moduleFixture.createNestApplication();
  await app.init();
};

const teardown = async () => {
  await db.dropDatabase();
  await app.close();
};

beforeAll(async () => {
  try {
    await setup();
  } catch (e) {
    console.error('Test suites setup process failed');
    console.error(e);
  }
});

afterAll(async () => {
  try {
    await teardown();
  } catch (e) {
    console.error(e);
  }
});

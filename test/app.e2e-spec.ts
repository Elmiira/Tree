import * as request from 'supertest';
import { app, db } from './setup';
import { dbNodes, idStringifiedDdNodes } from '../src/sample-data/index';

describe('AppController (e2e)', () => {

  beforeAll(async () => {
    await db.collection('tree').insertMany(dbNodes);
  });

  afterAll(async () => {
    await db.collection('tree').drop();
  });

  it('/ (GET) : It should return a whole list of tree node', async () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ status: 200, res: idStringifiedDdNodes });
  });
});

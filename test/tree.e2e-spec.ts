import * as request from 'supertest';
import { app, db } from './setup';
import { dbNodes } from '../src/sample-data/index';
import { ObjectID } from 'mongodb';

describe('TreeController (e2e)', () => {

  beforeAll(async () => {
    await db.collection('tree').insertMany(dbNodes);
  });

  afterAll(async () => {
    await db.collection('tree').drop();
  });

  it('/ (getSubTrees): It should return all ancestors of a given node', async () => {
    const id = new ObjectID('5da9aef00b5e8d41605d12fd');
    const parentInfo = await db.collection('tree').findOne({ _id: id });
    const results = await db.collection('tree')
      .find({ ancestors: parentInfo.name })
      .sort({ height: 1 })
      .toArray();
    const mongoStreamingCompatibleResult = results.map(res => (
      {
        ...res,
        _id: (res._id).toString(),
        parentId: (res.parentId).toString()
      }))
    await request(app.getHttpServer())
      .get('/tree/search5da9aef00b5e8d41605d12fd')
      .expect(200)
      .expect({ status: 200, res: mongoStreamingCompatibleResult })
  });

  it('/ (getSubTrees): Bad Request with invalid request param', async () => {
    await request(app.getHttpServer())
      .get('/tree/search5da9aef00b5e8d41605d12fg')
      .expect({ status: 404, res: [] })
  });

  it('/ (changeParentNode): It should change parent node of a given node', async () => {
    const response = await request(app.getHttpServer())
      .post('/tree/update')
      .send({
        srcNode: '5da9aef00b5e8d41605d12fe',
        tarNode: '5da9aef00b5e8d41605d12ff'
      })
      .expect(201)
      .set('created', 'application/json')
    expect(response.body).toEqual({ status: 201 });
  });
});

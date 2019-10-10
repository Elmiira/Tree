import { IMongoModuleOptions } from './mongo/index';
import { WorkLoadConcern }            from './app/types/WorkLoad';
import 'dotenv/config';

const appKey        = process.env.APP_KEY        || 'some-random-string';
const serverAddress = process.env.SERVER_ADDRESS || 'http://localhost:3000';

const config: IConfig = {
  app: {
    port: process.env.PORT || 3000,
    url:  serverAddress,
    key:  appKey,
  },
  mongo: {
    name: process.env.MONGO_DB_NAME || 'Project',
    host: process.env.MONGO_HOST || 'localhost:27017',
  },
 dbWorkLoad: WorkLoadConcern.WRITE_INTENSIVE,
};
export default config;

interface IConfig {
  app:    any;
  mongo: IMongoModuleOptions;
  dbWorkLoad: WorkLoadConcern;
};

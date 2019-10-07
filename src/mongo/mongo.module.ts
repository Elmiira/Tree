
import { DynamicModule, Global, Module }  from '@nestjs/common';
import { ConnectionService }                             from './mongo.service';
import { Db, MongoClient }                                from 'mongodb';
import IMongoModuleOptions                         from './IMongoModuleOptions';
import { mongoConnectionToken, mongoClientToken, mongoConfigToken } from './constants';

const connectionProvider = {
  provide: mongoConnectionToken,
  useFactory: (client: MongoClient, config: IMongoModuleOptions): Db => {
    return client.db(config.name);
  },
  inject: [mongoClientToken, mongoConfigToken],
};

const clientProvider = {
  provide: mongoClientToken,
  useFactory: (config: IMongoModuleOptions): Promise<MongoClient> => {
    const mongoService = new ConnectionService(config);
    return mongoService.getClient();
  },
  inject: [mongoConfigToken],
};

const createConfigProvider = (config) => ({
  provide: mongoConfigToken,
  useValue: config,
});
@Global()
@Module({})
export class MongoModule {
  static forRoot(config: IMongoModuleOptions): DynamicModule {
    const configProvider = createConfigProvider(config);

    return {
      module: MongoModule,
      providers: [connectionProvider, clientProvider, configProvider],
      exports: [connectionProvider, clientProvider, configProvider],
    };
  }
}

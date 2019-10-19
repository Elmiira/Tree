
import { Db, IndexSpecification }                  from 'mongodb';
import { Inject, Logger }                         from '@nestjs/common';
import { mongoConnectionToken, mongoClientToken } from './constants';

export const InjectConnection = () => Inject(mongoConnectionToken);
export const InjectClient     = () => Inject(mongoClientToken);
export const IndexDB = (collectionName: string, indexes: Array<IndexSpecification>): MethodDecorator => {
	return (target, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
		return {
			value: async function (...args: any[]) {
				const logger = new Logger();
				const method = descriptor.value;
				try {
					const db: Db = this.mongoConnection;
					await db.collection(collectionName).createIndexes(indexes);
					logger.log(`Mongo Indexing: ${indexes.length} new indexes inserted`);
				} catch (error) {
					logger.error("Error: indexing failed")
				}
				const result = await method.apply(this, args);
				return result;
			}
		} as TypedPropertyDescriptor<any>;
	}
}
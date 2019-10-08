import { Injectable } from '@nestjs/common';
import indexes from './mongoIndexes';
import { Db, InjectConnection, ObjectID, index } from '../mongo/index';

@Injectable()
export class TreeService {
	constructor(@InjectConnection() private readonly mongoConnection: Db) { }

	async getHello(params): Promise<string> {
		try {
		    this.initializer();
			return 'Knock out today :) !!';
		} catch (error) {
			console.log(error);
			//TODO: Error Handler here
			return ("errorr")
		}
	}

	async findAllChildrenById(): Promise<any> {

	}

	async findImmediateChildren(): Promise<any> {

	}


	async initializer(): Promise<void> {
		// const collections = this.mongoConnection.listCollections();
		 this.batchEntry("hi");
		console.log( " \n \n *****************************")
	}

	@index("test", indexes,)
	async batchEntry(newNode): Promise<Boolean> {
		return true;
	}

}

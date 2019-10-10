import { IDBNode, ITreeNode }        from './interfaces/index';
import config                         from '../config';
import { Db, ObjectID }              from 'mongodb';
import { IndexDB, InjectConnection } from '../mongo/index';
import indexList                     from './mongoIndexes';
import { Injectable, Logger }        from '@nestjs/common';
import { WorkLoadConcern }           from '../app/types/WorkLoad';

@Injectable()
export class TreeService {
	logger = new Logger();
	constructor(@InjectConnection() private readonly mongoConnection: Db) { }

	@IndexDB("tree", indexList)
	async checkCollectionExistence(): Promise<boolean> {
		const collections = await this.mongoConnection.listCollections({}, { nameOnly: true }).toArray();
		return collections.some(collection => { collection.name === 'tree' });
	};

	async generateTree(treeNode: ITreeNode, parent: IDBNode = null) {
		if (typeof (treeNode) === 'object') {
			parent = await this.createNode({ node: treeNode.root, parent });
			treeNode.children.map(child => this.generateTree(child, parent));
		}
		else {
			this.createNode({ node: treeNode, parent });
		}
	}

	async createNode({ node, parent }: { node: string; parent: IDBNode; }): Promise<any> {
		try {
			const res = await this.mongoConnection.collection('tree').insertOne({
				name: node,
				height: parent ? parent.height + 1 : 0,
				parentId: parent ? parent._id : null,
				path: parent ? this.generatePath(parent.path, parent.name) : null
			})
			return (res.ops[0]);
		} catch (error) {
			this.logger.error('error here ', error);
		}
	};

	generatePath(ParentPath: string | null, parentName: string): string {
		// ** root, child1, child2, ..., **
		const suffix = "**";
		const childPath = ParentPath ? suffix.concat(ParentPath.replace(/\*/g, '')) : suffix;
		return childPath.concat(parentName, ",", suffix);
	}

	async findDescenders(id: ObjectID): Promise<any> {
		if(config.dbWorkLoad === WorkLoadConcern.WRITE_INTENSIVE){
			return await this.findDescendersWithWritePriority(id);
		}
		else if(config.dbWorkLoad === WorkLoadConcern.READ_INTENSIVE){
			return await this.findDescendersWithReadPriority(id);
		}
		//TODO: return for rare cases error handling
	};

	async findDescendersWithWritePriority(id: ObjectID) {
		try {
			const result = await this.mongoConnection.collection('tree')
				.aggregate([
					{ $match: { "_id": id } },
					{
						$graphLookup: {
							from: "tree",
							startWith: "$_id",
							connectFromField: "_id",
							connectToField: "parentId",
							depthField: "depth",
							as: "descenders",
						}
					},
					{ $sort: {'descenders.depth': 1 }}
				])
				.toArray();
			return result
		} catch (error) {
			this.logger.error(error);
		}
	};

	async findDescendersWithReadPriority(id: ObjectID):Promise<any> {
	};

	async updateNode(srcNode: ObjectID, tarNode: ObjectID): Promise<boolean> {
		if(config.dbWorkLoad === WorkLoadConcern.WRITE_INTENSIVE){
			return await this.updateImmediateChild(srcNode, tarNode);
		}
		else if(config.dbWorkLoad ===  WorkLoadConcern.READ_INTENSIVE){
			return await this.updateDescenders(srcNode, tarNode);
		}
	};

	async updateImmediateChild(srcNode: ObjectID, tarNode: ObjectID): Promise<boolean> {
		try {
			const res = await this.mongoConnection.collection('tree').updateOne(
				{ _id: srcNode },
				{ $set: { 'parentId': tarNode } }
			);
			const { n, ok } = res.result;
			return n === 1 && ok === 1;
		} catch (error) {
			this.logger.error(error);
		}
	};

	async updateDescenders(srcNode: ObjectID, tarNode: ObjectID): Promise<boolean> {
		try {
			return true;
		} catch (error) {
			this.logger.error(error);
		}
	};
};
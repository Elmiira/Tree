import config from '../config';
import { IDBNode, ITreeNode, IGetTreeResponse } from './interfaces/index';
import indexList from './mongoIndexes';
import { Db, ObjectID, MongoClient } from 'mongodb';
import { IndexDB, InjectConnection, InjectClient } from '../mongo/index';
import { Injectable, Logger } from '@nestjs/common';
import { WorkLoadConcern } from '../app/types/WorkLoad';

@Injectable()
export class TreeService {
	logger = new Logger();
	constructor(
		@InjectConnection() private readonly mongoConnection: Db,
		@InjectClient() private readonly mongoClient: MongoClient,
	) { }

	@IndexDB("tree", indexList)
	async checkCollectionExistence(): Promise<boolean> {
		const nodesCount: number = await this.mongoConnection.collection('tree').countDocuments();
		return nodesCount !== 0;
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
		const res = await this.mongoConnection.collection('tree').insertOne({
			name:      node,
			height:    parent ? parent.height + 1 : 0,
			parentId:  parent ? parent._id : null,
			ancestors: parent ? (parent.ancestors || []).concat(parent.name) : null
		})
		return (res.ops[0]);
	};

	async getTree(): Promise<IGetTreeResponse> {
		try {
			const nodeList = await this.mongoConnection.collection('tree')
				.find({})
				.sort({ height: 1 })
				.toArray();
			return { status: 200, res: nodeList };
		} catch (error) {
			return this.handleError(error);
		}
	};

	async findDescenders(id: ObjectID): Promise<any> {
		if (config.dbWorkLoad === WorkLoadConcern.READ_INTENSIVE) {
			return await this.findDescendersWithReadPriority(id);
		}
		else if (config.dbWorkLoad === WorkLoadConcern.WRITE_INTENSIVE) {
			return await this.findDescendersWithWritePriority(id);
		}
	};

	async findDescendersWithReadPriority(id: ObjectID): Promise<any> {
		try {
			const srcNodeInfo: IDBNode = await this.mongoConnection.collection('tree').findOne({ _id: id });
			if (!srcNodeInfo) { throw Error('Invalid input data') }
			const result = await this.mongoConnection.collection('tree')
				.find({ ancestors: srcNodeInfo.name })
				.sort({ height: 1 })
				.toArray();
			return { res: result, status: 200 }
		} catch (error) {
		  return this.handleError(error);
		}
	};

	handleError(error: string) {
		this.logger.error(error);
		switch (error) {
			case 'Error: Invalid input data':
				return { status: 400, res: [] };
			default:
				return { status: 503, res: [] };
		}
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
					{ $sort: { 'descenders.depth': 1 } }
				])
				.toArray();
			return result
		} catch (error) {
			this.logger.error(error);
		}
	};

	async updateNode(srcNode: ObjectID, tarNode: ObjectID): Promise<boolean> {
		if (config.dbWorkLoad === WorkLoadConcern.READ_INTENSIVE) {
			return await this.updateDescenders(srcNode, tarNode);
		}
		else if (config.dbWorkLoad === WorkLoadConcern.WRITE_INTENSIVE) {
			return await this.updateImmediateChildren(srcNode, tarNode);
		}
	};

	async updateDescenders(srcNode: ObjectID, tarNode: ObjectID): Promise<any> {
		const session = this.mongoClient.startSession();
		let status = 201;
		try {
			const srcNodeInfo: IDBNode = await this.mongoConnection.collection('tree').findOne({ _id: srcNode });
			const tarNodeInfo: IDBNode = await this.mongoConnection.collection('tree').findOne({ _id: tarNode });
			if (!srcNodeInfo || !tarNodeInfo) { throw Error('Invalid input Data') };
			// *** in case of  practical using of this method, src/tarNode info could be gained directly via api params
			const heightDiffVal: number = tarNodeInfo.height - srcNodeInfo.height + 1;
			const srcNodeNewAncestors: Array<string> =
				tarNodeInfo.ancestors
					?
					tarNodeInfo.ancestors.concat(tarNodeInfo.name)
					:
					[tarNodeInfo.name];

			session.startTransaction({
				readConcern: { level: 'majority' },
				writeConcern: { w: 'majority' },
			});
			//TODO: Implement Mongo Transaction as a method decorator, like @indexDB one!
			await this.mongoConnection.collection('tree').updateOne(
				{ _id: srcNode },
				{
					$set: {
						'parentId': tarNode,
						'height': tarNodeInfo.height + 1,
						'ancestors': srcNodeNewAncestors,
					}
				},
			);

			await this.mongoConnection.collection('tree').updateMany(
				{ ancestors: srcNodeInfo.name },
				{
					$pull: { "ancestors": { $in: srcNodeInfo.ancestors } },
					$inc: { 'height': heightDiffVal },
				}
			);

			const res = await this.mongoConnection.collection('tree').updateMany(
				{ ancestors: srcNodeInfo.name },
				{
					$push: { "ancestors": { $each: srcNodeNewAncestors, $position: 0, } },
				}
			);

			await session.commitTransaction();
			this.logger.log('Mongo: Transaction committed.')
			this.logger.log(`${res.result.n} of ${srcNodeInfo.name} descenders are updated`);
		} catch (error) {
			session.abortTransaction();
			this.logger.error(error);
			switch (error) {
				case 'Error: Invalid input data':
					status = 400;
				default:
					status = 503;
			}
		} finally {
			session.endSession();
			return { status };
		}
	};

	async updateImmediateChildren(srcNode: ObjectID, tarNode: ObjectID): Promise<boolean> {
		try {
			const res = await this.mongoConnection.collection('tree').updateOne(
				{ _id: srcNode },
				{ $set: { 'parentId': tarNode, } }
			);
			const { n, ok } = res.result;
			return n === 1 && ok === 1;
		} catch (error) {
			this.logger.error(error);
		}
	};
};

import { IDBNode, ITreeNode } from './interfaces/index';
import { Db } from 'mongodb';
import { IndexDB, InjectConnection } from '../mongo/index';
import indexList from './mongoIndexes';
import { Injectable, Logger } from '@nestjs/common';

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
				name:     node,
				height:   parent ? parent.height + 1 : 0,
				parentId: parent ? parent._id : null,
				path:     parent ? this.generatePath(parent.path, parent.name) : null
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


		async findAllChildrenById(): Promise<any> {

		}
	
		async findImmediateChildren(): Promise<any> {
	
		}
	
		async updateChildren() {
			// 1- check if future node is its immediat children
			// if yes: then update both two nodes : parentId , path
			// yes
			// get remove from path of target  then name of changed one b, increment the height parent to his oarent
			// then update b based on c: parrent and heigh and and its path ( exactly before **)
			// if no just update the changed one path
			// for childreen should know incement all or not!
		}
};
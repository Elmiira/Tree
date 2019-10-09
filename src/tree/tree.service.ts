import { Injectable } from '@nestjs/common';
import indexList from './mongoIndexes';
import INode from './interfaces/INode';
import NodeList from '../sample-data/tree.sample';
import { Db, InjectConnection, ObjectID, indexDB } from '../mongo/index';

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
	//TODO: change name with unique id

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


	async initializer(): Promise<void> {
		const dbNotExist = true; //TODO:
		if (dbNotExist) {
			this.generateTree();
		}
	};

	@indexDB("tree", indexList)
	async generateTree() {
		let parentInfo = await this.createNode({ nodeName: 'root', parent: null });
		let i = 0 ;
		while( i < NodeList.length){
			parentInfo = await this.createNode({ nodeName: NodeList[i], parent: parentInfo });
			i++;
		};
	}

	async createNode({ nodeName, parent }: { nodeName: string; parent: INode; }): Promise<any>  {
		try {
			//{ result: { ok: 1, n: 1  , ops }
			const res = await this.mongoConnection.collection('tree').insertOne({
				name: nodeName,
				height: parent ? parent.height + 1 : 0,
				parentId: parent ? parent._id : null,
				path: parent ? this.generatePath(parent.path, parent.name) : null
			})
			return (res.ops[0]);
		} catch (error) {
			console.log("error here ", error);
		}
	}

	generatePath(ParentPath: string | null, parentName: string): string {
		// ** name1, name2, name3, ** 
		const suffix = "**";
		const childPath =  ParentPath ? suffix.concat(ParentPath.replace(/\*/g, '')) : suffix;
		return childPath.concat(parentName, ",", suffix);
	}
}
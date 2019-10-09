import { ObjectID } from 'mongodb';
export default interface INode {
	WithId: any,
	_id: ObjectID,
	name: string,
	height: number,
	parentId: ObjectID;
	path: string,
}

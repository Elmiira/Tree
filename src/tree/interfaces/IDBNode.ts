import { ObjectID } from 'mongodb';
export interface IDBNode {
	_id: ObjectID,
	name: string,
	height: number,
	parentId: ObjectID;
	ancestors: string[],
};

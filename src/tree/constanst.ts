import {  ObjectID } from '../mongo/index';

export default interface INode {
    id: ObjectID,
    parentId: ObjectID,
    

}


// 1) node identification
// 2) who is the parent node
// 3) who is the root node
// 4) the height of the node. In the above example, height(root) = 0 and height(a) == 1.
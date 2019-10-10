import { IDBNode }                       from './interfaces/index';
import { Controller, Get, Post, Logger } from '@nestjs/common';
import TreeData                          from '../sample-data/tree.sample';
import { TreeService }                   from './tree.service';

@Controller()
export class TreeController {
  logger = new Logger();
  constructor(private readonly treeService: TreeService) {}

  @Get()
  async getReady(): Promise<string> {
    const collExist = await this.treeService.checkCollectionExistence(); //TODO: boolean + error handler
		if (!collExist) {
      this.logger.log('Initializing: is generating tree...');
			await this.treeService.generateTree(TreeData);
		}
    return 'Knock out today :)!!'
  }

  @Get("/search")
  async getChildren(parent: IDBNode): Promise<Array<IDBNode>> {
    return [{
      _id: null,
      name: 'test',
      height: 3,
      parentId: null,
      path: 'hi',
      }
    ];
  }

  @Post("/update")
  async changeParentNode(srcNode: IDBNode, tarNode: IDBNode): Promise<boolean> {
    return true;
  }
}

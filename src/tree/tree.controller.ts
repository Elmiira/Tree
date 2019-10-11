import { IDBNode }                       from './interfaces/index';
import { ObjectID }                      from 'mongodb';
import { Controller, Get, Post, Logger } from '@nestjs/common';
import TreeData                          from '../sample-data/tree.sample';
import { TreeService }                   from './tree.service';


@Controller()
export class TreeController {
  logger = new Logger();
  constructor(private readonly treeService: TreeService) {}

  @Get()
  async getReady(): Promise<Array<IDBNode>> {
    const collExist = await this.treeService.checkCollectionExistence(); //TODO: error handler
		if (!collExist) {
      this.logger.log('Initializing: is generating tree...');
			await this.treeService.generateTree(TreeData);
    }
    // await this.treeService.updateNode(new ObjectID("5da0864dcddee10006ca7c45"), new ObjectID("5da0864dcddee10006ca7c49"));
    return await this.treeService.findDescenders(new ObjectID("5da0864dcddee10006ca7c44"));
  }

  @Get("/search")
  async getSubTrees(parentId: string): Promise<Array<IDBNode>> {
    return await this.treeService.findDescenders(new ObjectID(parentId));
  }

  @Post("/update")
  async changeParentNode(srcNode: string, tarNode: string): Promise<boolean> {
    return await this.treeService.updateNode(new ObjectID(srcNode), new ObjectID(tarNode));
    //TODO: error handler
  }
}
import { Controller, Get, Post, Logger, Body, Param } from '@nestjs/common';
import { IDBNode }       from './interfaces/index';
import { ObjectID }      from 'mongodb';
import { TreeService }   from './tree.service';
import { UpdateTreeDto } from './types/index';
import { node } from 'prop-types';

@Controller('/tree')
export class TreeController {
  logger = new Logger();
  constructor(private readonly treeService: TreeService) {}

  @Get("/search:id")
  async getSubTrees(@Param('id') nodeId): Promise<Array<IDBNode>> {
    return await this.treeService.findDescenders(new ObjectID(nodeId));
  }

  @Post("/update")
  async changeParentNode(@Body() updateTreeDto: UpdateTreeDto ): Promise<boolean> {
    const { srcNode, tarNode } = updateTreeDto;
    return await this.treeService.updateNode(new ObjectID(srcNode), new ObjectID(tarNode));
    //TODO: error handler
  }
}

import { Controller, Get, Post, Logger, Body, Param } from '@nestjs/common';
import { IGetTreeResponse } from './interfaces/index';
import { ObjectID }      from 'mongodb';
import { TreeService }   from './tree.service';
import { UpdateTreeDto } from './types/index';

@Controller('/tree')
export class TreeController {
  logger = new Logger();
  constructor(private readonly treeService: TreeService) {}

  @Get("/search:id")
  async getSubTrees(@Param('id') nodeId): Promise<IGetTreeResponse> {
    try {
      return await this.treeService.findDescenders(new ObjectID(nodeId));
    } catch (error) {
      this.logger.log(error)
      return { status: 404, res: [] }
    }
  }

  @Post("/update")
  async changeParentNode(@Body() updateTreeDto: UpdateTreeDto ): Promise<boolean> {
    const { srcNode, tarNode } = updateTreeDto;
    return await this.treeService.updateNode(new ObjectID(srcNode), new ObjectID(tarNode));    
  }
}

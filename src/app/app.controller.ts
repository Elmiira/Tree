import { Controller, Logger, Get } from '@nestjs/common';
import TreeData from '../sample-data/tree.sample';
import { TreeService } from '../tree/tree.service';
import { IGetTreeResponse } from 'src/tree/interfaces';

@Controller()
export class AppController {
  logger = new Logger();
  constructor(private readonly treeService: TreeService) { }

  @Get()
  async getReady(): Promise<IGetTreeResponse> {
    try {
      const collExist = await this.treeService.checkCollectionExistence();
      if (!collExist) {
        this.logger.log('Initializing: is generating tree...');
        await this.treeService.generateTree(TreeData);
      }
      return await this.treeService.getTree();
    } catch (error) {
      return { status: 503, res: [] }
    }
  }
}

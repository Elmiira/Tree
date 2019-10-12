import { Controller, Logger, Get } from '@nestjs/common';
import TreeData         from '../sample-data/tree.sample';
import { TreeService }  from '../tree/tree.service';

@Controller('/app')
export class AppController {
  logger = new Logger();
  constructor(private readonly treeService: TreeService) {}

  @Get()
  async getReady(): Promise<any> {
    const collExist = await this.treeService.checkCollectionExistence();
		if (!collExist) {
      this.logger.log('Initializing: is generating tree...');
			await this.treeService.generateTree(TreeData);
    }
    const tree = await this.treeService.getTree();
    return tree;
  }
}
//TODO: error handler

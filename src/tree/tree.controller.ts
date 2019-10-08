import { Controller, Get, Post } from '@nestjs/common';
import { TreeService } from './tree.service';


@Controller()
export class TreeController {
  constructor(private readonly treeService: TreeService) {}

  @Get()
  getHello(): Promise<string> {
    return this.treeService.getHello("elmiraaaa");
  }

  @Post("/test")
  firstTry(): string {
    return " hi edli :) ";
    // return this.appService.getHello();
  }
}

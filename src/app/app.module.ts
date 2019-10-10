import config              from '../config';
import { Module }         from '@nestjs/common';
import { MongoModule }    from '../mongo/mongo.module';
import { TreeController } from '../tree/tree.controller';
import { TreeService }    from '../tree/tree.service';

@Module({
  imports: [    
     MongoModule.forRoot(config.mongo),
  ],
  controllers: [TreeController],
  providers  : [TreeService],
})
export class AppModule { }
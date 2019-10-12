import config              from '../config';
import { Module }         from '@nestjs/common';
import { AppController } from '../app/app.controller';
import { MongoModule }    from '../mongo/mongo.module';
import { TreeController } from '../tree/tree.controller';
import { TreeService }    from '../tree/tree.service';

@Module({
  imports: [    
     MongoModule.forRoot(config.mongo),
  ],
  controllers: [AppController, TreeController],
  providers  : [TreeService],
})
export class AppModule { }

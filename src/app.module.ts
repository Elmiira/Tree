import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoModule } from './mongo/mongo.module';
import config from './config';


@Module({
  imports: [    
     MongoModule.forRoot(config.mongo),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

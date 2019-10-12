import { NestFactory } from '@nestjs/core';
import { AppModule }   from './app/app.module';
import config from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(config.app.port);
}
bootstrap();
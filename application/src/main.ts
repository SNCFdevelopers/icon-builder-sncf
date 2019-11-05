import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // limit each IP to 20 requests per windowMs
    }),
  );
  await app.listen(3000);
}
bootstrap();

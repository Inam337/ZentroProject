import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // OpenAPI (Swagger) JSON
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Zentro API')
    .setDescription('Zentro eCommerce backend API')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  // Expose the raw spec (Scalar can read this)
  app.use('/api.json', (_req, res) => res.json(document));

  // Scalar API Reference UI
  app.use(
    '/reference',
    apiReference({
      url: '/api.json',
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

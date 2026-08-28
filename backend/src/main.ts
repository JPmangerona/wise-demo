import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  console.log('⏳ Iniciando backend...');
  console.log('PORT env:', process.env.PORT);

  const app = await NestFactory.create(AppModule);

  // CORS aberto para diagnosticar - restringir depois
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Base System API')
    .setDescription('Documentação oficial das APIs do sistema Base System (SaaS Multi-Tenant)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.PORT || '3002', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend rodando na porta ${port} no host 0.0.0.0`);
}

bootstrap().catch((err) => {
  console.error('❌ Falha ao iniciar o backend:', err);
  process.exit(1);
});

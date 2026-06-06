import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: Permite que o frontend (porta 3003) se comunique com o backend (porta 3002)
  app.enableCors({
    origin: true, // Em desenvolvimento, permite qualquer origin (ex: localhost:3003 ou 192.168.0.x:3003)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Prefixo global: todas as rotas começam com /api/v1
  app.setGlobalPrefix('api/v1');

  // ValidationPipe global: valida automaticamente TODOS os DTOs em TODAS as rotas
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Remove campos que não estão no DTO
    forbidNonWhitelisted: true, // Retorna erro se enviar campo não permitido
    transform: true,            // Converte o JSON puro em instância da classe DTO
  }));

  // Configuração do Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('Base System API')
    .setDescription('Documentação oficial das APIs do sistema Base System (SaaS Multi-Tenant)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();

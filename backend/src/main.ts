import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const normalizeOrigin = (origin?: string) => origin?.replace(/\/$/, '');
  const allowedOrigins = new Set([
    ...((process.env.FRONTEND_URL || '').split(',').map(normalizeOrigin)),
    'https://wise-estagio.up.railway.app',
    'http://localhost:3003',
    'http://localhost:3000',
  ].filter((origin): origin is string => Boolean(origin)));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(normalizeOrigin(origin) || '')) {
        callback(null, origin);
        return;
      }

      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  });

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

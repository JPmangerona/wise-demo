import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseConfig } from './config/supabase.config';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { FinancialModule } from './modules/financial/financial.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: SupabaseConfig,
    }),
    UsersModule,
    ClientsModule,
    TasksModule,
    AgendaModule,
    FinancialModule,
    ProcessesModule,
    CompaniesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    // Guard global: TODAS as rotas exigem JWT, exceto as marcadas com @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

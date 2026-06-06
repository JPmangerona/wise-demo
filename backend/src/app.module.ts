import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseConfig } from './config/supabase.config';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { RevenuesModule } from './modules/revenues/revenues.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

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
    RevenuesModule,
    ExpensesModule,
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
export class AppModule { }

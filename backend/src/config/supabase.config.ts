
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class SupabaseConfig implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) { }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            url: this.configService.get<string>('DATABASE_URL'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,                   // Cria as tabelas automaticamente em desenvolvimento
            ssl: { rejectUnauthorized: false },  // Obrigatório para conexão segura com o Supabase
        };
    }
}

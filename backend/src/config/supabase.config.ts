
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class SupabaseConfig implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) { }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        const dbUrl = this.configService.get<string>('DATABASE_URL');
        return {
            type: 'postgres',
            url: dbUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: { rejectUnauthorized: false },
            extra: {
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000,
            },
        };
    }
}

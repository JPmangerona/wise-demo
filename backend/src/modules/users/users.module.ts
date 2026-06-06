import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserEntity } from './entities/user.entity';

@Module({
    imports: [
        // 1. Informa ao TypeORM que este módulo utiliza a entidade UserEntity
        TypeOrmModule.forFeature([UserEntity]),
    ],
    controllers: [
        // 2. Registra o Controller para que o NestJS ative as rotas HTTP de usuários
        UsersController,
    ],
    providers: [
        // 3. Registra as classes de lógica e banco para o NestJS gerenciar e injetar as dependências
        UsersService,
        UsersRepository,
    ],
    exports: [
        // 4. Exporta o service e repository para que outros módulos (como Auth) possam usá-los
        UsersService,
        UsersRepository,
    ],
})
export class UsersModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientsRepository } from './clients.repository';
import { ClientEntity } from './entities/client.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ClientEntity])],
    controllers: [ClientsController],
    providers: [ClientsService, ClientsRepository],
    exports: [ClientsService],
})
export class ClientsModule { }

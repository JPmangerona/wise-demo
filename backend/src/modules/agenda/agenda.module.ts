import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
import { AgendaRepository } from './agenda.repository';
import { AgendaEntity } from './entities/agenda.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgendaEntity])],
  controllers: [AgendaController],
  providers: [AgendaService, AgendaRepository],
  exports: [AgendaService, AgendaRepository],
})
export class AgendaModule {}

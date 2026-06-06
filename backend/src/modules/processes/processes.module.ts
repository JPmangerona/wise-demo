import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessesService } from './processes.service';
import { ProcessesController } from './processes.controller';
import { ProcessEntity } from './entities/process.entity';
import { ProcessUserEntity } from './entities/process-user.entity';
import { ProcessesRepository } from './processes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessEntity, ProcessUserEntity])],
  controllers: [ProcessesController],
  providers: [ProcessesService, ProcessesRepository],
  exports: [ProcessesService],
})
export class ProcessesModule {}

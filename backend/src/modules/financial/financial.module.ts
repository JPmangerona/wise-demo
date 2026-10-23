import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialEntity } from './entities/financial.entity';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { FinancialRepository } from './financial.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialEntity])],
  controllers: [FinancialController],
  providers: [FinancialService, FinancialRepository],
  exports: [FinancialService, FinancialRepository],
})
export class FinancialModule {}

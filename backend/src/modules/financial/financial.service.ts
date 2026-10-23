import { Injectable, ForbiddenException } from '@nestjs/common';
import { FinancialRepository } from './financial.repository';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto } from './dto/update-financial.dto';
import { FinancialType } from './entities/financial.entity';

@Injectable()
export class FinancialService {
  constructor(private readonly financialRepository: FinancialRepository) {}

  async findAll(user: any, type?: FinancialType) {
    const where: any = { companyId: user.companyId };
    if (type) {
      where.type = type;
    }
    return this.financialRepository.findAll(where);
  }

  async findOne(id: string, user: any) {
    const record = await this.financialRepository.findById(id);

    if (record.companyId !== user.companyId) {
      throw new ForbiddenException('Você não tem permissão para acessar este lançamento financeiro');
    }

    return record;
  }

  async create(createFinancialDto: CreateFinancialDto, user: any) {
    return this.financialRepository.create(createFinancialDto, user.companyId);
  }

  async update(id: string, updateFinancialDto: UpdateFinancialDto, user: any) {
    await this.findOne(id, user);
    return this.financialRepository.update(id, updateFinancialDto);
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.financialRepository.remove(id);
  }
}

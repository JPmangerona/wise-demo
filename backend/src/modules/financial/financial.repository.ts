import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { FinancialEntity } from './entities/financial.entity';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto } from './dto/update-financial.dto';

@Injectable()
export class FinancialRepository {
  constructor(
    @InjectRepository(FinancialEntity)
    private readonly repository: Repository<FinancialEntity>,
  ) {}

  async findAll(where: FindOptionsWhere<FinancialEntity> | FindOptionsWhere<FinancialEntity>[]): Promise<FinancialEntity[]> {
    return this.repository.find({
      where,
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<FinancialEntity> {
    const record = await this.repository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Lançamento financeiro não encontrado');
    return record;
  }

  async create(dto: CreateFinancialDto, companyId: string): Promise<FinancialEntity> {
    const record = this.repository.create({
      ...dto,
      companyId,
    });
    return this.repository.save(record);
  }

  async update(id: string, dto: UpdateFinancialDto): Promise<FinancialEntity> {
    const record = await this.findById(id);
    Object.assign(record, dto);
    return this.repository.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findById(id);
    await this.repository.softRemove(record);
  }
}

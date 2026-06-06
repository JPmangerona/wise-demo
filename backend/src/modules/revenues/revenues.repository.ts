import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { RevenueEntity } from './entities/revenue.entity';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';

@Injectable()
export class RevenuesRepository {
    constructor(
        @InjectRepository(RevenueEntity)
        private readonly repository: Repository<RevenueEntity>,
    ) { }

    async findAll(where: FindOptionsWhere<RevenueEntity> | FindOptionsWhere<RevenueEntity>[]): Promise<RevenueEntity[]> {
        // Ordena por data decrescente (receitas mais recentes primeiro)
        return this.repository.find({ 
            where, 
            order: { date: 'DESC', createdAt: 'DESC' } 
        });
    }

    async findById(id: string): Promise<RevenueEntity> {
        const revenue = await this.repository.findOne({ where: { id } });
        if (!revenue) throw new NotFoundException('Receita não encontrada');
        return revenue;
    }

    async create(
        dto: CreateRevenueDto,
        companyId: string
    ): Promise<RevenueEntity> {
        const revenue = this.repository.create({
            ...dto,
            companyId,
        });
        return this.repository.save(revenue);
    }

    async update(id: string, dto: UpdateRevenueDto): Promise<RevenueEntity> {
        const revenue = await this.findById(id);
        Object.assign(revenue, dto);
        return this.repository.save(revenue);
    }

    async remove(id: string): Promise<void> {
        const revenue = await this.findById(id);
        await this.repository.remove(revenue);
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesRepository {
    constructor(
        @InjectRepository(ExpenseEntity)
        private readonly repository: Repository<ExpenseEntity>,
    ) { }

    async findAll(where: FindOptionsWhere<ExpenseEntity> | FindOptionsWhere<ExpenseEntity>[]): Promise<ExpenseEntity[]> {
        // Ordena por data decrescente (despesas mais recentes primeiro)
        return this.repository.find({ 
            where, 
            order: { date: 'DESC', createdAt: 'DESC' } 
        });
    }

    async findById(id: string): Promise<ExpenseEntity> {
        const expense = await this.repository.findOne({ where: { id } });
        if (!expense) throw new NotFoundException('Despesa não encontrada');
        return expense;
    }

    async create(
        dto: CreateExpenseDto,
        companyId: string
    ): Promise<ExpenseEntity> {
        const expense = this.repository.create({
            ...dto,
            companyId,
        });
        return this.repository.save(expense);
    }

    async update(id: string, dto: UpdateExpenseDto): Promise<ExpenseEntity> {
        const expense = await this.findById(id);
        Object.assign(expense, dto);
        return this.repository.save(expense);
    }

    async remove(id: string): Promise<void> {
        const expense = await this.findById(id);
        await this.repository.remove(expense);
    }
}

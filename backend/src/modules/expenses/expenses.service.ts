import { Injectable, ForbiddenException } from '@nestjs/common';
import { ExpensesRepository } from './expenses.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async findAll(user: any) {
    // Isolamento Tenant: usuário só vê despesas da sua própria empresa
    return this.expensesRepository.findAll({ companyId: user.companyId });
  }

  async findOne(id: string, user: any) {
    const expense = await this.expensesRepository.findById(id);

    // Validação de isolamento do Tenant
    if (expense.companyId !== user.companyId) {
      throw new ForbiddenException('Você não tem permissão para acessar esta despesa');
    }

    return expense;
  }

  async create(createExpenseDto: CreateExpenseDto, user: any) {
    // A despesa é vinculada à empresa do usuário
    return this.expensesRepository.create(createExpenseDto, user.companyId);
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, user: any) {
    // Reutiliza o findOne para garantir isolamento e permissão
    await this.findOne(id, user);
    return this.expensesRepository.update(id, updateExpenseDto);
  }

  async remove(id: string, user: any) {
    // Reutiliza o findOne para garantir isolamento e permissão
    await this.findOne(id, user);
    return this.expensesRepository.remove(id);
  }
}

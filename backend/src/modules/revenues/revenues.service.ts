import { Injectable, ForbiddenException } from '@nestjs/common';
import { RevenuesRepository } from './revenues.repository';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';

@Injectable()
export class RevenuesService {
  constructor(private readonly revenuesRepository: RevenuesRepository) {}

  async findAll(user: any) {
    // Todos da empresa têm acesso às receitas da sua própria empresa
    // Opcional: Se Staff não pudesse ver financeiro, você adicionaria um bloqueio aqui
    // Ex: if (user.role === 'STAFF') throw new ForbiddenException();
    // Como o usuário não especificou restrição para Staff na receita, vamos liberar para a empresa.
    return this.revenuesRepository.findAll({ companyId: user.companyId });
  }

  async findOne(id: string, user: any) {
    const revenue = await this.revenuesRepository.findById(id);

    // Validação de isolamento do Tenant: A receita DEVE ser da empresa do usuário
    if (revenue.companyId !== user.companyId) {
      throw new ForbiddenException('Você não tem permissão para acessar esta receita');
    }

    return revenue;
  }

  async create(createRevenueDto: CreateRevenueDto, user: any) {
    // A receita é vinculada APENAS à empresa, como o usuário solicitou
    return this.revenuesRepository.create(createRevenueDto, user.companyId);
  }

  async update(id: string, updateRevenueDto: UpdateRevenueDto, user: any) {
    // Reutiliza o findOne para garantir que a receita pertence à empresa do usuário
    await this.findOne(id, user);
    return this.revenuesRepository.update(id, updateRevenueDto);
  }

  async remove(id: string, user: any) {
    // Reutiliza o findOne para garantir que a receita pertence à empresa do usuário
    await this.findOne(id, user);
    return this.revenuesRepository.remove(id);
  }
}

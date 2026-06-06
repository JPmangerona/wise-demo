import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessesRepository } from './processes.repository';

@Injectable()
export class ProcessesService {
  constructor(private readonly repository: ProcessesRepository) {}

  create(createProcessDto: CreateProcessDto, user: any) {
    return this.repository.create(createProcessDto, user.companyId, user.id);
  }

  findAll(user: any) {
    return this.repository.findAll({ companyId: user.companyId });
  }

  async findOne(id: string, user: any) {
    const process = await this.repository.findById(id);
    if (process.companyId !== user.companyId) {
      throw new ForbiddenException('Você não tem permissão para acessar este processo');
    }
    return process;
  }

  async update(id: string, updateProcessDto: UpdateProcessDto, user: any) {
    // Valida se o processo pertence à empresa
    await this.findOne(id, user);
    return this.repository.update(id, updateProcessDto);
  }

  async remove(id: string, user: any) {
    // Valida se o processo pertence à empresa
    await this.findOne(id, user);
    return this.repository.remove(id);
  }
}

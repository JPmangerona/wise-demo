import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessesRepository } from './processes.repository';
import { ProcessStatus } from './entities/process.entity';

@Injectable()
export class ProcessesService {
  constructor(private readonly repository: ProcessesRepository) {}

  create(createProcessDto: CreateProcessDto, user: any) {
    if (createProcessDto.status && createProcessDto.status !== ProcessStatus.ATIVO) {
      throw new BadRequestException('O status inicial de um processo deve ser ATIVO.');
    }
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
    const process = await this.findOne(id, user);

    if (updateProcessDto.status && updateProcessDto.status !== process.status) {
      const newStatus = updateProcessDto.status;
      const currentStatus = process.status;
      let isValidTransition = false;

      if (currentStatus === ProcessStatus.ATIVO) {
        isValidTransition = [
          ProcessStatus.SUSPENSO,
          ProcessStatus.ENCERRADO,
          ProcessStatus.ARQUIVADO,
        ].includes(newStatus);
      } else if (currentStatus === ProcessStatus.SUSPENSO) {
        isValidTransition = [
          ProcessStatus.ATIVO,
          ProcessStatus.ARQUIVADO,
        ].includes(newStatus);
      } else if (currentStatus === ProcessStatus.ENCERRADO) {
        isValidTransition = [
          ProcessStatus.ARQUIVADO,
        ].includes(newStatus);
      } else if (currentStatus === ProcessStatus.ARQUIVADO) {
        isValidTransition = false;
      }

      if (!isValidTransition) {
        throw new BadRequestException(
          `Transição de estado inválida de ${currentStatus} para ${newStatus}.`
        );
      }
    }

    return this.repository.update(id, updateProcessDto);
  }

  async remove(id: string, user: any) {
    // Valida se o processo pertence à empresa
    await this.findOne(id, user);
    return this.repository.remove(id);
  }
}

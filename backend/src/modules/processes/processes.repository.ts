import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProcessEntity } from './entities/process.entity';
import { ProcessUserEntity } from './entities/process-user.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';

@Injectable()
export class ProcessesRepository {
  constructor(
    @InjectRepository(ProcessEntity)
    private readonly repository: Repository<ProcessEntity>,
    @InjectRepository(ProcessUserEntity)
    private readonly processUserRepository: Repository<ProcessUserEntity>,
  ) {}

  async findAll(where: FindOptionsWhere<ProcessEntity> | FindOptionsWhere<ProcessEntity>[]): Promise<ProcessEntity[]> {
    return this.repository.find({
      where,
      relations: ['processUsers'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ProcessEntity> {
    const process = await this.repository.findOne({
      where: { id },
      relations: ['processUsers'],
    });
    if (!process) throw new NotFoundException('Processo não encontrado');
    return process;
  }

  async create(
    dto: CreateProcessDto,
    companyId: string,
    createdById: string,
  ): Promise<ProcessEntity> {
    const { userIds, clientId, ...processData } = dto;

    // 1. Cria o processo
    const process = this.repository.create({
      ...processData,
      companyId,
      createdById,
      clientId: clientId || undefined,
    });
    const savedProcess = await this.repository.save(process);

    // 2. Se foram informados IDs de usuários, cria os vínculos na tabela intermediária
    if (userIds && userIds.length > 0) {
      const processUsers = userIds.map(userId =>
        this.processUserRepository.create({
          processId: savedProcess.id,
          userId,
        }),
      );
      await this.processUserRepository.save(processUsers);
    }

    // 3. Retorna o processo com os vínculos populados
    return this.findById(savedProcess.id);
  }

  async update(id: string, dto: UpdateProcessDto): Promise<ProcessEntity> {
    const process = await this.findById(id);
    const { userIds, clientId, ...processData } = dto;

    // 1. Atualiza os campos do processo (incluindo clientId)
    Object.assign(process, processData);
    if (clientId !== undefined) process.clientId = clientId;
    await this.repository.save(process);

    // 2. Se o array de userIds foi informado, substitui todos os vínculos
    if (userIds !== undefined) {
      // Remove os vínculos antigos
      await this.processUserRepository.delete({ processId: id });

      // Cria os novos vínculos
      if (userIds.length > 0) {
        const processUsers = userIds.map(userId =>
          this.processUserRepository.create({
            processId: id,
            userId,
          }),
        );
        await this.processUserRepository.save(processUsers);
      }
    }

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const process = await this.findById(id);
    // Os registros em process_users são removidos automaticamente (onDelete: CASCADE)
    await this.repository.remove(process);
  }
}

import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { AgendaRepository } from './agenda.repository';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';

@Injectable()
export class AgendaService {
  constructor(private readonly agendaRepository: AgendaRepository) {}

  async findAll(user: any) {
    if (user.role === 'ADMIN') {
      // ADMIN tem acesso à agenda de toda a empresa
      return this.agendaRepository.findAll({ companyId: user.companyId });
    } else {
      // STAFF vê compromissos que ele criou OU que foram designados para ele
      return this.agendaRepository.findAll([
        { companyId: user.companyId, createdById: user.id },
        { companyId: user.companyId, assignedToId: user.id },
      ]);
    }
  }

  async findOne(id: string, user: any) {
    const agenda = await this.agendaRepository.findById(id);

    // Validação de isolamento do Tenant
    if (agenda.companyId !== user.companyId) {
      throw new ForbiddenException('Você não tem permissão para acessar este compromisso');
    }

    // Validação de isolamento da Staff (só vê o seu — criou ou foi designado)
    if (user.role === 'STAFF' && agenda.createdById !== user.id && agenda.assignedToId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para acessar o compromisso de outro usuário');
    }

    return agenda;
  }

  async create(createAgendaDto: CreateAgendaDto, user: any) {
    // Validação: não permitir duas tarefas na mesma data e horário
    const existingTasks = await this.agendaRepository.findAll([
      { 
        companyId: user.companyId, 
        createdById: user.id, 
        date: createAgendaDto.date, 
        startTime: createAgendaDto.startTime 
      },
      ...(createAgendaDto.assignedToId ? [{
        companyId: user.companyId,
        assignedToId: createAgendaDto.assignedToId,
        date: createAgendaDto.date,
        startTime: createAgendaDto.startTime
      }] : [])
    ]);

    if (existingTasks.length > 0) {
      throw new ConflictException('Já existe um compromisso agendado para esta mesma data e horário.');
    }

    // O compromisso é criado pelo usuário logado
    return this.agendaRepository.create(createAgendaDto, user.companyId, user.id);
  }

  async update(id: string, updateAgendaDto: UpdateAgendaDto, user: any) {
    // Reutiliza o findOne para checar as permissões
    await this.findOne(id, user);
    return this.agendaRepository.update(id, updateAgendaDto);
  }

  async remove(id: string, user: any) {
    // Reutiliza o findOne para checar as permissões
    await this.findOne(id, user);
    return this.agendaRepository.remove(id);
  }
}

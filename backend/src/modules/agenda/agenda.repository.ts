import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { AgendaEntity } from './entities/agenda.entity';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';

@Injectable()
export class AgendaRepository {
    constructor(
        @InjectRepository(AgendaEntity)
        private readonly repository: Repository<AgendaEntity>,
    ) { }

    async findAll(where: FindOptionsWhere<AgendaEntity> | FindOptionsWhere<AgendaEntity>[]): Promise<AgendaEntity[]> {
        // Ordena por data e depois por hora de início
        return this.repository.find({ 
            where, 
            order: { date: 'ASC', startTime: 'ASC' } 
        });
    }

    async findById(id: string): Promise<AgendaEntity> {
        const agenda = await this.repository.findOne({ where: { id } });
        if (!agenda) throw new NotFoundException('Compromisso não encontrado');
        return agenda;
    }

    async create(
        dto: CreateAgendaDto,
        companyId: string,
        createdById: string
    ): Promise<AgendaEntity> {
        const agenda = this.repository.create({
            ...dto,
            companyId,
            createdById,
            assignedToId: dto.assignedToId || undefined,
        });
        return this.repository.save(agenda);
    }

    async update(id: string, dto: UpdateAgendaDto): Promise<AgendaEntity> {
        const agenda = await this.findById(id);
        Object.assign(agenda, dto);
        return this.repository.save(agenda);
    }

    async remove(id: string): Promise<void> {
        const agenda = await this.findById(id);
        await this.repository.remove(agenda);
    }
}

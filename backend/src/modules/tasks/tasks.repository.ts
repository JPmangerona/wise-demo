import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksRepository {
    constructor(
        @InjectRepository(TaskEntity)
        private readonly repository: Repository<TaskEntity>,
    ) { }

    async findAll(where: FindOptionsWhere<TaskEntity> | FindOptionsWhere<TaskEntity>[]): Promise<TaskEntity[]> {
        return this.repository.find({ where, order: { createdAt: 'DESC' } });
    }

    async findById(id: string, where?: FindOptionsWhere<TaskEntity> | FindOptionsWhere<TaskEntity>[]): Promise<TaskEntity> {
        const query: any = { id };
        if (where) {
            // Se houver condições adicionais (como restrição de companyId ou permissionamento)
            // Precisamos garantir que a query obedeça a todas as condições.
            // Para simplificar, estamos passando a responsabilidade de verificar se a task encontrada
            // pertence ao usuário/empresa para a camada de Service, ou injetando as condições no findOne.
        }
        
        // Forma simples: apenas encontra a task e o service valida se o usuário tem permissão
        const task = await this.repository.findOne({ where: { id } });
        if (!task) throw new NotFoundException('Tarefa não encontrada');
        return task;
    }

    async create(
        dto: CreateTaskDto,
        companyId: string,
        createdById: string
    ): Promise<TaskEntity> {
        const task = this.repository.create({
            ...dto,
            companyId,
            createdById,
            assignedToId: dto.assignedToId || undefined,
        });
        return this.repository.save(task);
    }

    async update(id: string, dto: UpdateTaskDto): Promise<TaskEntity> {
        const task = await this.findById(id);
        Object.assign(task, dto);
        return this.repository.save(task);
    }

    async remove(id: string): Promise<void> {
        const task = await this.findById(id);
        await this.repository.remove(task);
    }
}

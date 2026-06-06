import { Injectable, ForbiddenException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  // O user logado vem do Request (req.user)
  async findAll(user: any) {
    if (user.role === 'ADMIN') {
      // ADMIN: Vê todas as tarefas da empresa
      return this.tasksRepository.findAll({ companyId: user.companyId });
    } else {
      // STAFF: Vê apenas as tarefas em que é o criador OU o responsável, dentro da mesma empresa
      return this.tasksRepository.findAll([
        { companyId: user.companyId, createdById: user.id },
        { companyId: user.companyId, assignedToId: user.id },
      ]);
    }
  }

  async findOne(id: string, user: any) {
    const task = await this.tasksRepository.findById(id);

    // Verificação de isolamento Tenant
    if (task.companyId !== user.companyId) {
      throw new ForbiddenException('Você não tem permissão para acessar esta tarefa');
    }

    // Verificação de isolamento Staff
    if (user.role === 'STAFF') {
      if (task.createdById !== user.id && task.assignedToId !== user.id) {
        throw new ForbiddenException('Você não tem permissão para acessar esta tarefa privada');
      }
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, user: any) {
    // A tarefa é criada pertencendo à empresa do usuário logado e tendo ele como criador
    return this.tasksRepository.create(createTaskDto, user.companyId, user.id);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: any) {
    // Reutilizamos a lógica do findOne para garantir que ele tem permissão de ver/editar
    await this.findOne(id, user);
    return this.tasksRepository.update(id, updateTaskDto);
  }

  async remove(id: string, user: any) {
    // Reutilizamos a lógica do findOne para garantir que ele tem permissão de ver/excluir
    await this.findOne(id, user);
    return this.tasksRepository.remove(id);
  }
}

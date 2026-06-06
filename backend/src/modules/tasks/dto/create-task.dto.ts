import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ description: 'O título da tarefa' })
  @IsString()
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório' })
  title: string;

  @ApiPropertyOptional({ description: 'A descrição detalhada da tarefa' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'ID do usuário responsável', type: String })
  @IsUUID(4, { message: 'ID do responsável inválido' })
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Prioridade da tarefa', enum: TaskPriority })
  @IsEnum(TaskPriority, { message: 'Prioridade inválida' })
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Status da tarefa', enum: TaskStatus })
  @IsEnum(TaskStatus, { message: 'Status inválido' })
  @IsOptional()
  status?: TaskStatus;
}

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgendaCategory } from '../entities/agenda.entity';

export class CreateAgendaDto {
  @ApiProperty({ description: 'O título do compromisso' })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title: string;

  @ApiProperty({ description: 'Data do compromisso no formato YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty({ message: 'A data é obrigatória' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD' })
  date: string;

  @ApiProperty({ description: 'Horário de início (HH:mm:ss ou HH:mm)' })
  @IsString()
  @IsNotEmpty({ message: 'O horário de início é obrigatório' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'Formato de hora inválido' })
  startTime: string;

  @ApiProperty({ description: 'Horário de fim (HH:mm:ss ou HH:mm)' })
  @IsString()
  @IsNotEmpty({ message: 'O horário de fim é obrigatório' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'Formato de hora inválido' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Categoria do evento na agenda', enum: AgendaCategory })
  @IsEnum(AgendaCategory, { message: 'Categoria inválida' })
  @IsOptional()
  category?: AgendaCategory;

  @ApiPropertyOptional({ description: 'Localização física ou link da reunião' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada do compromisso' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'UUID do usuário para quem o compromisso é designado' })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}

import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, IsArray, MaxLength } from 'class-validator';
import { ProcessStatus } from '../entities/process.entity';

export class CreateProcessDto {
  @IsString({ message: 'O número do processo (CNJ) deve ser um texto' })
  @IsNotEmpty({ message: 'O número do processo (CNJ) não pode ser vazio' })
  @MaxLength(100, { message: 'O número do processo (CNJ) não pode ter mais de 100 caracteres' })
  cnj: string;

  @IsString({ message: 'O título / causa deve ser um texto' })
  @IsNotEmpty({ message: 'O título / causa não pode ser vazio' })
  @MaxLength(100, { message: 'O título / causa não pode ter mais de 100 caracteres' })
  title: string;

  @IsEnum(ProcessStatus, { message: 'Status inválido' })
  @IsOptional()
  status?: ProcessStatus;

  @IsString()
  @IsOptional()
  tribunal?: string;

  @IsString()
  @IsOptional()
  vara?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID('4')
  @IsOptional()
  clientId?: string; // UUID do cliente vinculado ao processo

  @IsString({ message: 'A parte contrária deve ser um texto' })
  @IsOptional()
  @MaxLength(255, { message: 'A parte contrária não pode ter mais de 255 caracteres' })
  adverseParty?: string;

  // Array de UUIDs dos usuários responsáveis pelo processo (relação N:M)
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  userIds?: string[];
}

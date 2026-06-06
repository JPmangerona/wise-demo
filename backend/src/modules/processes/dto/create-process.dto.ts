import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ProcessStatus } from '../entities/process.entity';

export class CreateProcessDto {
  @IsString()
  @IsNotEmpty()
  cnj: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(ProcessStatus)
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

  // Array de UUIDs dos usuários responsáveis pelo processo (relação N:M)
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  userIds?: string[];
}

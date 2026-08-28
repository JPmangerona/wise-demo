import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateProcessDto } from './create-process.dto';

export class UpdateProcessDto extends PartialType(CreateProcessDto) {
  @IsString({ message: 'A parte contrária deve ser um texto' })
  @IsOptional()
  @MaxLength(255, { message: 'A parte contrária não pode ter mais de 255 caracteres' })
  adverseParty?: string;
}

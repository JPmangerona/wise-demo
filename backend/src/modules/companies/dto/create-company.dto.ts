import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Empresa Teste' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '11.222.333/0001-44', required: false })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @ApiProperty({ example: 'contato@teste.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '(11) 99999-9999', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}

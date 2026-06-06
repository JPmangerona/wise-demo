import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RevenuePaymentMethod, RevenueStatus } from '../entities/revenue.entity';

export class CreateRevenueDto {
  @ApiProperty({ description: 'Nome do cliente' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório' })
  clientName: string;

  @ApiPropertyOptional({ description: 'ID do cliente se for cadastrado', type: String })
  @IsUUID(4, { message: 'ID de cliente inválido' })
  @IsOptional()
  clientId?: string;

  @ApiProperty({ description: 'Descrição da receita' })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @ApiProperty({ description: 'Valor da receita' })
  @IsNumber({}, { message: 'O valor deve ser numérico' })
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  amount: number;

  @ApiProperty({ description: 'Data da receita no formato YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty({ message: 'A data é obrigatória' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD' })
  date: string;

  @ApiPropertyOptional({ description: 'Método de pagamento', enum: RevenuePaymentMethod })
  @IsEnum(RevenuePaymentMethod, { message: 'Método de pagamento inválido' })
  @IsOptional()
  paymentMethod?: RevenuePaymentMethod;

  @ApiPropertyOptional({ description: 'Status do pagamento', enum: RevenueStatus })
  @IsEnum(RevenueStatus, { message: 'Status de pagamento inválido' })
  @IsOptional()
  status?: RevenueStatus;
}

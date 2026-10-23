import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinancialType, FinancialPaymentMethod, FinancialStatus } from '../entities/financial.entity';

export class CreateFinancialDto {
  @ApiProperty({ description: 'Tipo de lançamento (REVENUE ou EXPENSE)', enum: FinancialType })
  @IsEnum(FinancialType, { message: 'Tipo de lançamento inválido' })
  @IsNotEmpty({ message: 'O tipo de lançamento é obrigatório' })
  type: FinancialType;

  @ApiProperty({ description: 'Nome do cliente ou fornecedor' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da pessoa/empresa é obrigatório' })
  personName: string;

  @ApiPropertyOptional({ description: 'ID do cliente ou fornecedor', type: String })
  @IsUUID(4, { message: 'ID de pessoa inválido' })
  @IsOptional()
  personId?: string;

  @ApiProperty({ description: 'Descrição do lançamento' })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @ApiProperty({ description: 'Valor do lançamento' })
  @IsNumber({}, { message: 'O valor deve ser numérico' })
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  amount: number;

  @ApiProperty({ description: 'Data no formato YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty({ message: 'A data é obrigatória' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD' })
  date: string;

  @ApiPropertyOptional({ description: 'Método de pagamento', enum: FinancialPaymentMethod })
  @IsEnum(FinancialPaymentMethod, { message: 'Método de pagamento inválido' })
  @IsOptional()
  paymentMethod?: FinancialPaymentMethod;

  @ApiPropertyOptional({ description: 'Status do lançamento', enum: FinancialStatus })
  @IsEnum(FinancialStatus, { message: 'Status de pagamento inválido' })
  @IsOptional()
  status?: FinancialStatus;
}

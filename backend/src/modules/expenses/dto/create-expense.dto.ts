import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpensePaymentMethod, ExpenseStatus } from '../entities/expense.entity';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Nome do fornecedor ou favorecido' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do fornecedor é obrigatório' })
  supplierName: string;

  @ApiPropertyOptional({ description: 'ID do fornecedor se for cadastrado', type: String })
  @IsUUID(4, { message: 'ID de fornecedor inválido' })
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ description: 'Descrição da despesa' })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @ApiProperty({ description: 'Valor da despesa' })
  @IsNumber({}, { message: 'O valor deve ser numérico' })
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  amount: number;

  @ApiProperty({ description: 'Data da despesa ou vencimento no formato YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty({ message: 'A data é obrigatória' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD' })
  date: string;

  @ApiPropertyOptional({ description: 'Método de pagamento', enum: ExpensePaymentMethod })
  @IsEnum(ExpensePaymentMethod, { message: 'Método de pagamento inválido' })
  @IsOptional()
  paymentMethod?: ExpensePaymentMethod;

  @ApiPropertyOptional({ description: 'Status do pagamento', enum: ExpenseStatus })
  @IsEnum(ExpenseStatus, { message: 'Status de pagamento inválido' })
  @IsOptional()
  status?: ExpenseStatus;
}

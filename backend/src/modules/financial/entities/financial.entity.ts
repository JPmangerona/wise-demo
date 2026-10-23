import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum FinancialType {
  REVENUE = 'REVENUE', // Receita (Entrada)
  EXPENSE = 'EXPENSE', // Despesa (Saída)
}

export enum FinancialPaymentMethod {
  PIX = 'PIX',
  BOLETO = 'BOLETO',
  TRANSFER = 'TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
}

export enum FinancialStatus {
  PENDING = 'PENDING',   // Pendente (A receber / A pagar)
  PAID = 'PAID',         // Pago / Recebido
  OVERDUE = 'OVERDUE',   // Atrasado
  CANCELED = 'CANCELED', // Cancelado
}

@Entity('financial_records')
export class FinancialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type', type: 'enum', enum: FinancialType, default: FinancialType.REVENUE })
  type: FinancialType;

  @Column({ name: 'person_name', type: 'varchar', length: 255 })
  personName: string; // Nome do cliente ou fornecedor

  @Column({ name: 'person_id', type: 'uuid', nullable: true })
  personId?: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'date', type: 'date' })
  date: string; // Data YYYY-MM-DD

  @Column({ name: 'payment_method', type: 'enum', enum: FinancialPaymentMethod, default: FinancialPaymentMethod.PIX })
  paymentMethod: FinancialPaymentMethod;

  @Column({ name: 'status', type: 'enum', enum: FinancialStatus, default: FinancialStatus.PENDING })
  status: FinancialStatus;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}

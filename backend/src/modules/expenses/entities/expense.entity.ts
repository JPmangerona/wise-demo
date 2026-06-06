import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ExpensePaymentMethod {
  PIX = 'PIX',
  BOLETO = 'BOLETO',
  TRANSFER = 'TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
}

export enum ExpenseStatus {
  PENDING = 'PENDING', // Pendente (A pagar)
  PAID = 'PAID',       // Pago
  OVERDUE = 'OVERDUE', // Atrasado
}

@Entity('expenses')
export class ExpenseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'supplier_name', type: 'varchar', length: 255 })
  supplierName: string; // Nome do fornecedor ou destino da despesa

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId: string; // Opcional, caso o fornecedor esteja cadastrado no sistema

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'date', type: 'date' })
  date: string; // Data da despesa ou vencimento YYYY-MM-DD

  @Column({ name: 'payment_method', type: 'enum', enum: ExpensePaymentMethod, default: ExpensePaymentMethod.PIX })
  paymentMethod: ExpensePaymentMethod;

  @Column({ name: 'status', type: 'enum', enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string; // A despesa, assim como a receita, é isolada pela empresa

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

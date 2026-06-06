import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RevenuePaymentMethod {
  PIX = 'PIX',
  BOLETO = 'BOLETO',
  TRANSFER = 'TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
}

export enum RevenueStatus {
  PENDING = 'PENDING', // Pendente
  PAID = 'PAID',       // Pago / Recebido
  CANCELED = 'CANCELED', // Cancelado
}

@Entity('revenues')
export class RevenueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_name', type: 'varchar', length: 255 })
  clientName: string;

  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId: string; // Opcional: se o cliente estiver cadastrado no sistema

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'date', type: 'date' })
  date: string; // Formato YYYY-MM-DD

  @Column({ name: 'payment_method', type: 'enum', enum: RevenuePaymentMethod, default: RevenuePaymentMethod.PIX })
  paymentMethod: RevenuePaymentMethod;

  @Column({ name: 'status', type: 'enum', enum: RevenueStatus, default: RevenueStatus.PENDING })
  status: RevenueStatus;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string; // Vinculado APENAS à empresa, conforme solicitado

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

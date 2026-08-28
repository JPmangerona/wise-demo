import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type MovementOrigin = 'MANUAL' | 'API_TRIBUNAL' | 'API_INFOSIMPLES' | 'API_DATAJUD';
export type MovementStatus = 'PENDING' | 'VALIDATED';

@Entity('movements')
export class MovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'process_id', type: 'uuid' })
  processId: string;

  @Column({ name: 'date', type: 'varchar', length: 100 })
  date: string; // Ex: "28/08/2026, 14:35"

  @Column({ name: 'origin', type: 'varchar', length: 50 })
  origin: MovementOrigin;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'PENDING' })
  status: MovementStatus;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

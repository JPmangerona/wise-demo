import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AgendaCategory {
  MEETING = 'MEETING',
  HEARING = 'HEARING', // Audiência
  DEADLINE = 'DEADLINE', // Prazo
  TASK = 'TASK', // Tarefa agendada
  OTHER = 'OTHER',
}

@Entity('agenda')
export class AgendaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'date', type: 'date' })
  date: string; // Formato YYYY-MM-DD

  @Column({ name: 'start_time', type: 'time' })
  startTime: string; // Formato HH:mm:ss

  @Column({ name: 'end_time', type: 'time' })
  endTime: string; // Formato HH:mm:ss

  @Column({ name: 'category', type: 'enum', enum: AgendaCategory, default: AgendaCategory.OTHER })
  category: AgendaCategory;

  @Column({ name: 'location', type: 'varchar', length: 500, nullable: true })
  location: string; // Local ou Link da reunião

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId: string; // O usuário para quem o compromisso foi designado

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string; // O usuário que criou o compromisso

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string; // Para isolamento Multi-Tenant

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

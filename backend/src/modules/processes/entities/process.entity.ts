import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProcessUserEntity } from './process-user.entity';

export enum ProcessStatus {
  ATIVO = 'ATIVO',
  SUSPENSO = 'SUSPENSO',
  ARQUIVADO = 'ARQUIVADO',
  ENCERRADO = 'ENCERRADO',
}

@Entity('processes')
export class ProcessEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cnj', type: 'varchar', length: 100 })
  cnj: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'status', type: 'enum', enum: ProcessStatus, default: ProcessStatus.ATIVO })
  status: ProcessStatus;

  @Column({ name: 'tribunal', type: 'varchar', length: 100, nullable: true })
  tribunal: string;

  @Column({ name: 'vara', type: 'varchar', length: 100, nullable: true })
  vara: string;

  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId: string; // FK para a tabela clients (o cliente vinculado ao processo)

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamento N:M com users via tabela intermediária process_users
  @OneToMany(() => ProcessUserEntity, processUser => processUser.process, { cascade: true })
  processUsers: ProcessUserEntity[];
}

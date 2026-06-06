import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProcessEntity } from './process.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('process_users')
export class ProcessUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'process_id', type: 'uuid' })
  processId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Relacionamentos TypeORM
  @ManyToOne(() => ProcessEntity, process => process.processUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'process_id' })
  process: ProcessEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}

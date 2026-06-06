import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'clients' })
export class ClientEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', length: 100, nullable: false })
    name: string;

    @Column({ name: 'email', length: 70, nullable: true })
    email: string;

    @Column({ name: 'password', length: 255, nullable: true })
    password: string;

    @Column({ name: 'cpf_cnpj', length: 25, nullable: true })
    cpfCnpj: string;

    @Column({ name: 'phone', length: 20, nullable: true })
    phone: string;

    @Column({ name: 'address', length: 100, nullable: true })
    address: string;

    @Column({ name: 'address_number', length: 10, nullable: true })
    addressNumber: string;

    @Column({ name: 'address_complement', length: 100, nullable: true })
    addressComplement: string;

    @Column({ name: 'neighborhood', length: 50, nullable: true })
    neighborhood: string;

    @Column({ name: 'city', length: 50, nullable: true })
    city: string;

    @Column({ name: 'state', length: 50, nullable: true })
    state: string;

    @Column({ name: 'zip_code', length: 20, nullable: true })
    zipCode: string;

    @Column({ name: 'person_type', length: 15, nullable: true })
    personType: string;

    @Column({ name: 'birth_date', type: 'date', nullable: true })
    birthDate: Date;

    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @Column({ name: 'company_id', nullable: true })
    companyId: string;

    @Column({ name: 'can_access', default: false })
    canAccess: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relacionamentos TypeORM
    @ManyToOne(() => UserEntity, user => user.clientsRegistered)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}



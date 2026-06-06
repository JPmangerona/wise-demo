import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { ClientEntity } from '../../clients/entities/client.entity';

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', length: 100, nullable: false })
    name: string;

    @Column({ name: 'email', length: 70, nullable: false, unique: true })
    email: string;

    @Column({ name: 'password_hash', length: 255, nullable: false })
    passwordHash: string;

    // Single-tenant: apenas ADMIN ou STAFF
    @Column({ name: 'role', length: 25, default: 'STAFF' })
    role: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'phone', length: 20, nullable: true })
    phone: string;

    @Column({ name: 'address', length: 150, nullable: true })
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

    @Column({ name: 'cpf', length: 20, nullable: true })
    cpf: string;

    @Column({ name: 'birth_date', type: 'date', nullable: true })
    birthDate: Date;

    @Column({ name: 'photo', length: 100, nullable: true })
    photo: string;

    @Column({ name: 'commission', type: 'int', nullable: true })
    commission: number;

    @Column({ name: 'ref_id', nullable: true })
    refId: string;

    @Column({ name: 'pix', length: 100, nullable: true })
    pix: string;

    @Column({ name: 'pix_key_type', length: 100, nullable: true })
    pixKeyType: string;

    @Column({ name: 'token', length: 150, nullable: true })
    token: string;

    @Column({ name: 'can_access_panel', default: true })
    canAccessPanel: boolean;

    @Column({ name: 'show_records', default: true })
    showRecords: boolean;

    @Column({ name: 'company_id', nullable: false })
    companyId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relacionamentos TypeORM
    @OneToMany(() => ClientEntity, client => client.user)
    clientsRegistered: ClientEntity[];
}


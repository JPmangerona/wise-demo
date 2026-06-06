import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsRepository {
    constructor(
        @InjectRepository(ClientEntity)
        private readonly repository: Repository<ClientEntity>,
    ) { }

    async findAll(filter: { companyId: string }): Promise<ClientEntity[]> {
        return this.repository.find({ where: filter });
    }

    async findById(id: string): Promise<ClientEntity> {
        const client = await this.repository.findOne({ where: { id } });
        if (!client) throw new NotFoundException('Cliente não encontrado');
        return client;
    }

    async create(dto: CreateClientDto, passwordHash?: string): Promise<ClientEntity> {
        const client = this.repository.create({
            name: dto.name,
            email: dto.email,
            password: passwordHash,
            cpfCnpj: dto.cpfCnpj,
            phone: dto.phone,
            address: dto.address,
            addressNumber: dto.addressNumber,
            addressComplement: dto.addressComplement,
            neighborhood: dto.neighborhood,
            city: dto.city,
            state: dto.state,
            zipCode: dto.zipCode,
            personType: dto.personType,
            birthDate: dto.birthDate,
            userId: dto.userId,
            companyId: dto.companyId,
            canAccess: dto.canAccess,
        });
        return this.repository.save(client);
    }

    async update(id: string, dto: UpdateClientDto, passwordHash?: string): Promise<ClientEntity> {
        const client = await this.findById(id);
        const { password, ...data } = dto;
        Object.assign(client, data);
        if (passwordHash) {
            client.password = passwordHash;
        }
        return this.repository.save(client);
    }

    async remove(id: string): Promise<void> {
        const client = await this.findById(id);
        await this.repository.remove(client);
    }

    async findFirstCompanyId(): Promise<string | null> {
        const result = await this.repository.manager.query("SELECT id FROM companies LIMIT 1;");
        return result[0]?.id || null;
    }

    async findFirstUserId(companyId: string): Promise<string | null> {
        const result = await this.repository.manager.query("SELECT id FROM users WHERE company_id = $1 LIMIT 1;", [companyId]);
        return result[0]?.id || null;
    }
}

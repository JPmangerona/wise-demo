import { Injectable, ForbiddenException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ClientsService {
    constructor(
        private readonly clientsRepository: ClientsRepository,
    ) { }

    private async resolveMockUser(user: any): Promise<any> {
        const activeUser = { ...user };
        if (activeUser.companyId === 'mock-company-id') {
            const dbCompanyId = await this.clientsRepository.findFirstCompanyId();
            if (dbCompanyId) {
                activeUser.companyId = dbCompanyId;
            }
        }
        if (activeUser.id === 'mock-user-id') {
            const dbUserId = await this.clientsRepository.findFirstUserId(activeUser.companyId);
            if (dbUserId) {
                activeUser.id = dbUserId;
            }
        }
        return activeUser;
    }

    async findAll(user: any) {
        const activeUser = await this.resolveMockUser(user);
        if (!activeUser || activeUser.companyId === 'mock-company-id') {
            throw new ForbiddenException('Você precisa estar associado a uma empresa para listar os contatos');
        }
        return this.clientsRepository.findAll({ companyId: activeUser.companyId });
    }

    async findOne(id: string, user: any) {
        const activeUser = await this.resolveMockUser(user);
        if (!activeUser || activeUser.companyId === 'mock-company-id') {
            throw new ForbiddenException('Você precisa estar associado a uma empresa para buscar um contato');
        }
        const client = await this.clientsRepository.findById(id);
        if (client.companyId !== activeUser.companyId) {
            throw new ForbiddenException('Você não tem permissão para acessar este contato');
        }
        return client;
    }

    async create(createClientDto: CreateClientDto, user: any) {
        const activeUser = await this.resolveMockUser(user);
        if (!activeUser || activeUser.companyId === 'mock-company-id') {
            throw new ForbiddenException('Você precisa estar associado a uma empresa para adicionar um contato');
        }

        let hashedPassword: string | undefined = undefined;
        
        // Se a senha foi enviada, criptografamos para salvar no banco
        if (createClientDto.password) {
            hashedPassword = await bcrypt.hash(createClientDto.password, 10);
        }

        // Associa o contato automaticamente à empresa resolvida do usuário
        createClientDto.companyId = activeUser.companyId;
        createClientDto.userId = activeUser.id;

        return this.clientsRepository.create(createClientDto, hashedPassword);
    }

    async update(id: string, updateClientDto: UpdateClientDto, user: any) {
        // Garante que o contato pertence à empresa do usuário logado antes de atualizar
        await this.findOne(id, user);

        let hashedPassword: string | undefined = undefined;

        if (updateClientDto.password) {
            hashedPassword = await bcrypt.hash(updateClientDto.password, 10);
        }

        return this.clientsRepository.update(id, updateClientDto, hashedPassword);
    }

    async remove(id: string, user: any) {
        // Garante que o contato pertence à empresa do usuário logado antes de remover
        await this.findOne(id, user);
        return this.clientsRepository.remove(id);
    }
}

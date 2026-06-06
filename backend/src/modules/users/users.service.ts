import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
    ) { }

    async findAll(user: any) {
        return this.usersRepository.findAll(user.companyId);
    }

    async create(createUserDto: CreateUserDto, creator: any) {
        // Força o role como STAFF — apenas o ADMIN pode criar, e só cria STAFF
        createUserDto.role = 'STAFF';

        // Obrigatoriedade: Todos os usuários pertencem à empresa do criador
        createUserDto.companyId = creator.companyId;

        // Gera um hash seguro da senha com um custo de 10 rounds de salt
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        return this.usersRepository.create(createUserDto, hashedPassword);
    }

    async update(id: string, updateUserDto: UpdateUserDto, user: any) {
        // Valida se o usuário pertence à mesma empresa
        const targetUser = await this.usersRepository.findById(id);
        if (targetUser.companyId !== user.companyId) {
            throw new ForbiddenException('Você não tem permissão para alterar este usuário');
        }

        // Impede alteração de role para qualquer coisa diferente de STAFF
        if (updateUserDto.role && updateUserDto.role !== 'STAFF') {
            throw new BadRequestException('Apenas o role STAFF é permitido.');
        }

        let hashedPassword: string | undefined = undefined;
        if (updateUserDto.password) {
            hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
        }

        return this.usersRepository.update(id, updateUserDto, hashedPassword);
    }

    async remove(id: string, user: any) {
        // Valida se o usuário pertence à mesma empresa
        const targetUser = await this.usersRepository.findById(id);
        if (targetUser.companyId !== user.companyId) {
            throw new ForbiddenException('Você não tem permissão para remover este usuário');
        }
        return this.usersRepository.remove(id);
    }
}

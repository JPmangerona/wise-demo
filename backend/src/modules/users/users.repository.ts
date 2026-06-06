import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,
    ) { }

    async findAll(companyId?: string): Promise<UserEntity[]> {
        if (companyId) {
            return this.repository.find({ where: { companyId } });
        }
        return this.repository.find();
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.repository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<UserEntity> {
        const user = await this.repository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('Usuário não encontrado');
        return user;
    }

    async create(dto: CreateUserDto, hashedPassword: string): Promise<UserEntity> {
        const user = this.repository.create({
            name: dto.name,
            email: dto.email,
            passwordHash: hashedPassword,
            role: dto.role,
            isActive: dto.isActive,
            phone: dto.phone,
            address: dto.address,
            addressNumber: dto.addressNumber,
            addressComplement: dto.addressComplement,
            neighborhood: dto.neighborhood,
            city: dto.city,
            state: dto.state,
            zipCode: dto.zipCode,
            cpf: dto.cpf,
            birthDate: dto.birthDate,
            photo: dto.photo,
            commission: dto.commission,
            refId: dto.refId,
            pix: dto.pix,
            pixKeyType: dto.pixKeyType,
            token: dto.token,
            canAccessPanel: dto.canAccessPanel,
            showRecords: dto.showRecords,
            companyId: dto.companyId,
        });
        return this.repository.save(user);
    }

    async update(id: string, dto: UpdateUserDto, hashedPassword?: string): Promise<UserEntity> {
        const user = await this.findById(id);
        const { password, ...data } = dto;
        Object.assign(user, data);
        if (hashedPassword) {
            user.passwordHash = hashedPassword;
        }
        return this.repository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findById(id);
        await this.repository.remove(user);
    }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Busca o usuário pelo e-mail
    const user = await this.usersRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    // 2. Verifica se o usuário está ativo
    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada. Entre em contato com o administrador.');
    }

    // 3. Compara a senha informada com o hash salvo no banco
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    // 4. Gera o token JWT com os dados essenciais do usuário
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const token = this.jwtService.sign(payload);

    // 5. Retorna o token e dados básicos do usuário (sem a senha)
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }
}

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Decorator para marcar rotas que NÃO precisam de autenticação (ex: login)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

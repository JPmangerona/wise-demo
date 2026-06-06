# 📋 Demo Wise — Regra Principal de Desenvolvimento

> Regra obrigatória para todo o desenvolvimento do projeto Demo Wise.
> Qualquer código gerado DEVE seguir estas diretrizes.
> **Este é o documento único e fonte de verdade** — reflete fielmente o que está implementado no sistema.

---

## 1. Contexto do Projeto

**Demo Wise** é uma plataforma **LegalTech** para centralizar e automatizar a gestão de um escritório de advocacia. Integra quatro pilares:

1. **Contatos (Clientes)** — Cadastro de clientes do escritório (pessoas físicas ou jurídicas atendidas).
2. **Produtividade** — Agenda inteligente com sistema de tarefas e controle de prazos.
3. **Financeiro** — Controle de receitas e despesas separados, com métodos de pagamento e status.
4. **Gestão de Equipe (Acessos)** — Cadastro e gerenciamento de funcionários do escritório.

---

## 2. Arquitetura Single-Tenant

O sistema possui **um único escritório** (company) e **dois perfis de acesso**:

| Papel | Descrição | Criação |
|---|---|---|
| **ADMIN** | Dono do escritório. Único. Acesso total a todas as telas, incluindo **"Acessos"** (gestão de staff). | Criado manualmente no banco de dados. |
| **STAFF** | Funcionário do escritório. Criado pelo ADMIN via tela "Acessos". | Criado pela API (`POST /users`). |

### Controle de Acesso (Simples)

- **ADMIN** → Acesso a **TODAS** as telas do sistema.
- **STAFF** → Acesso a **TODAS** as telas **EXCETO "Acessos"**. Não pode ver, editar ou acessar a gestão de usuários.
- Não existe RBAC granular — a regra é apenas: `role === 'ADMIN'` ou `role === 'STAFF'`.

### Dados Fixos (Seed no Banco)

- **Company (empresa):** Criada e configurada manualmente no banco de dados (PostgreSQL/Supabase).
- **Admin (dono):** Criado manualmente no banco de dados com `role = 'ADMIN'` e vinculado à company.

---

## 3. Stack Obrigatória

| Camada | Tecnologias |
|---|---|
| **Backend** | Node.js + **NestJS** + **TypeORM** + TypeScript |
| **Banco de Dados** | **PostgreSQL** hospedado no Supabase (usado apenas como banco, sem SDK) |
| **Frontend** | Next.js (App Router) + React + TypeScript + Tailwind CSS |
| **Ícones** | `lucide-react` |
| **HTTP Client** | Axios (instância centralizada com interceptors de auth) |
| **Auth** | JWT (JSON Web Token) via `@nestjs/jwt` + `@nestjs/passport` *(planejado)* |
| **Versionamento** | Git + GitHub |

---

## 4. Requisitos Técnicos

### 4.1 Arquitetura Backend (4 Camadas)

```
Module › Controller › Service › Repository
```

- **Module:** Agrupa e organiza controllers, services e repositories de um domínio.
- **Controller:** Recebe requests via decorators (`@Get`, `@Post`, etc.), delega para o Service. **Sem lógica de negócio.**
- **Service:** Regras de negócio. **Nunca acessa o banco diretamente.** Injetado via `@Injectable()`.
- **Repository:** Acesso a dados via **TypeORM**. Único ponto de contato com o banco.

### 4.2 Rotas da API

Todas as rotas usam o prefixo global `/api/v1`:

```typescript
// main.ts
app.setGlobalPrefix('api/v1');
```

### 4.3 Banco de Dados

- **PostgreSQL** hospedado no Supabase (apenas como infra de banco — sem SDK do Supabase)
- Comunicação via **TypeORM** (`@nestjs/typeorm`)
- Acesso a dados **exclusivamente** via Repository
- `synchronize: true` em desenvolvimento
- Tabelas mapeadas com decorators do TypeORM (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.)

### 4.4 Variáveis de Ambiente

- Usar `@nestjs/config` com `ConfigModule.forRoot()`
- **NUNCA** commitar credenciais no repositório
- Arquivo `.env.example` com as variáveis necessárias (sem valores reais)

### 4.5 Validação de Dados

- Usar `class-validator` e `class-transformer` para validação via **DTOs**
- `ValidationPipe` habilitado globalmente:

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

### 4.6 Respostas de Erro

Utilizar o sistema de exceções do NestJS:

```typescript
throw new BadRequestException('Dados inválidos');
throw new UnauthorizedException('Não autenticado');
throw new ForbiddenException('Sem permissão');
throw new NotFoundException('Recurso não encontrado');
```

| Status | Significado | Quando ocorre |
|---|---|---|
| `200` | Sucesso | Operação realizada com sucesso |
| `201` | Criado | Recurso criado com sucesso |
| `400` | Bad Request | Dados inválidos ou regra de negócio violada |
| `401` | Não autenticado | Token JWT ausente ou expirado |
| `403` | Sem permissão | Usuário não tem acesso àquele recurso |
| `404` | Não encontrado | Recurso não existe no banco |
| `500` | Erro interno | Falha inesperada no servidor |

---

## 5. Estrutura de Pastas

### 5.1 Backend

```
backend/src/
├── config/
│   └── supabase.config.ts       # Configuração TypeORM com Supabase PostgreSQL
├── modules/
│   ├── users/                   # Gestão de usuários (Acessos)
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── dto/                 # CreateUserDto, UpdateUserDto
│   │   └── entities/            # UserEntity
│   ├── clients/                 # Contatos (clientes do escritório)
│   │   ├── clients.module.ts
│   │   ├── clients.controller.ts
│   │   ├── clients.service.ts
│   │   ├── clients.repository.ts
│   │   ├── dto/
│   │   └── entities/
│   ├── tasks/                   # Tarefas
│   │   └── ...
│   ├── agenda/                  # Agenda (compromissos)
│   │   └── ...
│   ├── revenues/                # Receitas
│   │   └── ...
│   └── expenses/                # Despesas
│       └── ...
├── app.module.ts                # Módulo raiz
└── main.ts                      # Entry point
```

### 5.2 Frontend

```
frontend/src/
├── app/
│   ├── login/
│   │   └── page.tsx              # Página de login
│   ├── (admin)/                  # Painel administrativo (layout com sidebar)
│   │   ├── layout.tsx            # Layout (Sidebar + Header)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard com contadores
│   │   ├── acessos/
│   │   │   └── page.tsx          # Gestão de STAFF (somente ADMIN)
│   │   ├── contatos/
│   │   │   └── page.tsx          # Gestão de clientes
│   │   ├── receita/
│   │   │   └── page.tsx          # Receitas
│   │   ├── despesa/
│   │   │   └── page.tsx          # Despesas
│   │   ├── relatorios/
│   │   │   └── page.tsx          # Relatórios financeiros
│   │   ├── tarefa/
│   │   │   └── page.tsx          # Tarefas
│   │   └── agenda/
│   │       └── page.tsx          # Agenda
│   ├── page.tsx                  # Landing / Redirect
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Estilos globais
├── components/
│   ├── ui/                       # Modal, Badge, Button, Input, Table...
│   └── layout/                   # Sidebar, Header
├── services/
│   └── api.ts                    # Instância Axios centralizada
└── types/
    └── index.ts                  # Interfaces TypeScript
```

---

## 6. Mapeamento Completo das Rotas da API

**Base URL:** `http://localhost:3000/api/v1`

### 6.1 Users (Acessos)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/users` | Listar todos os usuários |
| `POST` | `/users` | Cadastrar novo staff |
| `PUT` | `/users/:id` | Atualizar usuário |
| `DELETE` | `/users/:id` | Remover usuário |

**Regras de negócio do `POST /users`:**
- O `role` é **sempre forçado como `STAFF`** (a API não permite criar ADMIN)
- O `companyId` é **obrigatório**
- A senha é criptografada com `bcrypt` (10 rounds) antes de salvar

**Request Body (POST):**

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `name` | `string` | ✅ | Não pode ser vazio |
| `email` | `string` | ✅ | Deve ser e-mail válido |
| `password` | `string` | ✅ | Mínimo 6 caracteres |
| `companyId` | `string` | ✅ | UUID da empresa |
| `phone` | `string` | ❌ | — |
| `cpf` | `string` | ❌ | — |
| `address` | `string` | ❌ | — |
| `addressNumber` | `string` | ❌ | — |
| `addressComplement` | `string` | ❌ | — |
| `neighborhood` | `string` | ❌ | — |
| `city` | `string` | ❌ | — |
| `state` | `string` | ❌ | — |
| `zipCode` | `string` | ❌ | — |
| `birthDate` | `string (ISO date)` | ❌ | Formato: `YYYY-MM-DD` |
| `photo` | `string` | ❌ | — |
| `commission` | `number` | ❌ | Percentual de comissão |
| `pix` | `string` | ❌ | Chave PIX |
| `pixKeyType` | `string` | ❌ | Tipo da chave (`email`, `cpf`, `phone`, `random`) |

---

### 6.2 Clients (Contatos)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/clients` | Listar todos os clientes |
| `POST` | `/clients` | Cadastrar novo cliente |
| `PUT` | `/clients/:id` | Atualizar cliente |
| `DELETE` | `/clients/:id` | Remover cliente |

**Request Body (POST):**

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `name` | `string` | ✅ | Não pode ser vazio |
| `email` | `string` | ❌ | Deve ser e-mail válido |
| `password` | `string` | ❌ | Mínimo 6 caracteres (futuro portal do cliente) |
| `cpfCnpj` | `string` | ❌ | — |
| `phone` | `string` | ❌ | — |
| `address` | `string` | ❌ | — |
| `addressNumber` | `string` | ❌ | — |
| `addressComplement` | `string` | ❌ | — |
| `neighborhood` | `string` | ❌ | — |
| `city` | `string` | ❌ | — |
| `state` | `string` | ❌ | — |
| `zipCode` | `string` | ❌ | — |
| `personType` | `string` | ❌ | `'PF'` ou `'PJ'` |
| `birthDate` | `string (ISO date)` | ❌ | — |
| `userId` | `string (UUID)` | ❌ | ID do usuário que cadastrou |
| `companyId` | `string (UUID)` | ❌ | Injetado automaticamente pelo service |
| `canAccess` | `boolean` | ❌ | Padrão: `false` |

---

### 6.3 Tasks (Tarefas)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/tasks` | Listar tarefas (ADMIN: todas; STAFF: suas) |
| `POST` | `/tasks` | Criar nova tarefa |
| `GET` | `/tasks/:id` | Buscar tarefa por ID |
| `PUT` | `/tasks/:id` | Atualizar tarefa |
| `DELETE` | `/tasks/:id` | Remover tarefa |

**Regras de isolamento:**
- **ADMIN** vê todas as tarefas da empresa
- **STAFF** vê apenas tarefas que criou ou está como responsável

**Request Body (POST):**

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `title` | `string` | ✅ | Não pode ser vazio |
| `description` | `string` | ❌ | — |
| `assignedToId` | `string (UUID)` | ❌ | ID do responsável |
| `priority` | `enum` | ❌ | `LOW`, `MEDIUM`, `HIGH` |
| `status` | `enum` | ❌ | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELED` |

---

### 6.4 Agenda (Compromissos)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/agenda` | Listar compromissos (ADMIN: todos; STAFF: seus) |
| `POST` | `/agenda` | Criar novo compromisso |
| `GET` | `/agenda/:id` | Buscar compromisso por ID |
| `PUT` | `/agenda/:id` | Atualizar compromisso |
| `DELETE` | `/agenda/:id` | Remover compromisso |

**Regras de isolamento:**
- **ADMIN** vê toda a agenda da empresa
- **STAFF** vê apenas seus próprios compromissos

**Request Body (POST):**

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `title` | `string` | ✅ | Não pode ser vazio |
| `date` | `string` | ✅ | Formato `YYYY-MM-DD` |
| `startTime` | `string` | ✅ | Formato `HH:mm` |
| `endTime` | `string` | ✅ | Formato `HH:mm` |
| `category` | `enum` | ❌ | `MEETING`, `HEARING`, `DEADLINE`, `TASK`, `OTHER` |
| `location` | `string` | ❌ | — |
| `description` | `string` | ❌ | — |

---

### 6.5 Revenues (Receitas)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/revenues` | Listar todas as receitas |
| `POST` | `/revenues` | Criar nova receita |
| `GET` | `/revenues/:id` | Buscar receita por ID |
| `PUT` | `/revenues/:id` | Atualizar receita |
| `DELETE` | `/revenues/:id` | Remover receita |

**Request Body (POST):**

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `clientName` | `string` | ✅ | Não pode ser vazio |
| `clientId` | `string (UUID)` | ❌ | ID do cliente cadastrado |
| `description` | `string` | ✅ | Não pode ser vazio |
| `amount` | `number` | ✅ | Maior que 0.01 |
| `date` | `string` | ✅ | Formato `YYYY-MM-DD` |
| `paymentMethod` | `enum` | ❌ | `PIX`, `BOLETO`, `TRANSFER`, `CREDIT_CARD`, `CASH` |
| `status` | `enum` | ❌ | `PENDING`, `PAID`, `CANCELED` |

---

### 6.6 Expenses (Despesas)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/expenses` | Listar todas as despesas |
| `POST` | `/expenses` | Criar nova despesa |
| `GET` | `/expenses/:id` | Buscar despesa por ID |
| `PUT` | `/expenses/:id` | Atualizar despesa |
| `DELETE` | `/expenses/:id` | Remover despesa |

**Request Body (POST):**

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `supplierName` | `string` | ✅ | Não pode ser vazio |
| `supplierId` | `string (UUID)` | ❌ | ID do fornecedor |
| `description` | `string` | ✅ | Não pode ser vazio |
| `amount` | `number` | ✅ | Maior que 0.01 |
| `date` | `string` | ✅ | Formato `YYYY-MM-DD` |
| `paymentMethod` | `enum` | ❌ | `PIX`, `BOLETO`, `TRANSFER`, `CREDIT_CARD`, `CASH` |
| `status` | `enum` | ❌ | `PENDING`, `PAID`, `OVERDUE` |

---

## 7. Interfaces TypeScript (Frontend)

```typescript
// types/index.ts

// ---- TAREFAS ----
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId?: string;
  createdById: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// ---- AGENDA ----
export type AgendaCategory = 'MEETING' | 'HEARING' | 'DEADLINE' | 'TASK' | 'OTHER';

export interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: AgendaCategory;
  location?: string;
  description?: string;
  userId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// ---- RECEITAS ----
export type RevenuePaymentMethod = 'PIX' | 'BOLETO' | 'TRANSFER' | 'CREDIT_CARD' | 'CASH';
export type RevenueStatus = 'PENDING' | 'PAID' | 'CANCELED';

export interface Revenue {
  id: string;
  clientName: string;
  clientId?: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: RevenuePaymentMethod;
  status: RevenueStatus;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// ---- DESPESAS ----
export type ExpensePaymentMethod = 'PIX' | 'BOLETO' | 'TRANSFER' | 'CREDIT_CARD' | 'CASH';
export type ExpenseStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Expense {
  id: string;
  supplierName: string;
  supplierId?: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: ExpensePaymentMethod;
  status: ExpenseStatus;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// ---- CONTATOS (CLIENTES) ----
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  personType?: string;
  birthDate?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  userId?: string;
  companyId: string;
  createdAt: string;
}

// ---- USUÁRIOS (ACESSOS) ----
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
  phone?: string;
  cpf?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  companyId: string;
  createdAt: string;
}
```

---

## 8. Instância Axios Centralizada

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Injeta o token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Response: Redireciona para /login em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 9. Fluxo de Autenticação JWT *(Planejado)*

> **Nota:** O módulo de autenticação (`AuthModule`) ainda não está implementado. Quando implementado, seguirá este fluxo:

```
1. POST /api/v1/auth/login  →  { email, password }
2. Backend valida credenciais  →  retorna { accessToken: "JWT..." }
3. Frontend salva token no localStorage
4. Todas as requisições enviam: Authorization: Bearer <token>
5. Backend decodifica o token via JwtAuthGuard e injeta user no request
```

### Payload do Token JWT:

```json
{
  "userId": "uuid-do-usuario",
  "email": "usuario@email.com",
  "role": "ADMIN",
  "companyId": "uuid-da-empresa"
}
```

---

## 10. Navegação do Frontend (Sidebar)

| Categoria | Rota | Label | Ícone | Acesso |
|---|---|---|---|---|
| Geral | `/dashboard` | Dashboard | `LayoutDashboard` | ADMIN + STAFF |
| Geral | `/acessos` | Acessos | `Users` | **Somente ADMIN** |
| Contatos | `/contatos` | Contatos | `Contact` | ADMIN + STAFF |
| Financeiro | `/receita` | Receita | `TrendingUp` | ADMIN + STAFF |
| Financeiro | `/despesa` | Despesa | `TrendingDown` | ADMIN + STAFF |
| Financeiro | `/relatorios` | Relatórios | `FileText` | ADMIN + STAFF |
| Operacional | `/tarefa` | Tarefa | `CheckSquare` | ADMIN + STAFF |
| Operacional | `/agenda` | Agenda | `Calendar` | ADMIN + STAFF |

---

## 11. Regras de Implementação Frontend

- Usar `'use client'` apenas quando necessário (hooks, interatividade).
- **Estado:** `useState` / `useEffect` para estado local. `Context` para auth.
- **Modais:** Usar componente `Modal` para criar/editar — **não criar páginas separadas**.
- **Loading:** Sempre mostrar estado de loading em operações assíncronas.
- **Responsividade:** Layout funcional em desktop (não precisa ser mobile-first).

---

## 12. Convenções de Nomenclatura

| Item | Padrão | Exemplo |
|---|---|---|
| Arquivos de módulo | `kebab-case` + sufixo | `users.module.ts`, `users.controller.ts` |
| Classes | `PascalCase` | `UsersService`, `CreateUserDto` |
| Métodos/Variáveis | `camelCase` | `findAll()`, `hashedPassword` |
| Constantes | `UPPER_SNAKE_CASE` | `JWT_SECRET`, `MAX_RETRIES` |
| Tabelas no banco | `snake_case` | `users`, `revenues`, `expenses` |
| Componentes React | `PascalCase` | `ClientList`, `UserModal` |
| Hooks React | `camelCase` com prefixo `use` | `useAuth`, `useClients` |
| Pastas de rotas (Next.js) | `kebab-case` (em PT) | `(admin)/contatos/page.tsx` |

---

## 13. Boas Práticas

### Backend (NestJS)

- **Sempre** usar injeção de dependência (`constructor injection`)
- **Nunca** instanciar services manualmente — deixe o container do NestJS gerenciar
- **Sempre** separar DTOs para input (Create/Update)
- **Nunca** usar `any` como tipo — sempre tipar corretamente
- **Sempre** tratar erros usando as exceções do NestJS
- **Sempre** documentar endpoints com Swagger (`@ApiProperty`, `@ApiPropertyOptional`)

### Git

- Commits em português, descritivos e curtos
- Branches: `feature/nome`, `fix/nome`, `refactor/nome`

---

## 14. Swagger (Documentação Interativa)

A documentação interativa das APIs está disponível em:

```
http://localhost:3000/api/docs
```

O Swagger está configurado com o plugin automático do NestJS. As rotas estão organizadas por tags: `Users`, `Clients`, `Tasks`, `Agenda`, `Revenues`, `Expenses`.

---

## 15. Diagrama da Arquitetura

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│  Next.js + React + TypeScript + Tailwind     │
│  Axios → interceptors → Bearer Token         │
└──────────────────────┬──────────────────────┘
                       │ HTTP (JSON)
                       ▼
┌─────────────────────────────────────────────┐
│                  BACKEND                     │
│  Node.js + NestJS + TypeScript               │
│                                              │
│  Module → Controller → Service → Repository  │
│                                  → TypeORM   │
│                                              │
│  Módulos: users, clients, tasks, agenda,     │
│           revenues, expenses                 │
└──────────────────────┬──────────────────────┘
                       │ PostgreSQL (SSL)
                       ▼
┌─────────────────────────────────────────────┐
│               BANCO DE DADOS                 │
│  PostgreSQL hospedado no Supabase            │
│  (usado APENAS como banco — sem SDK)         │
│                                              │
│  Tabelas: users, clients, tasks, agendas,    │
│           revenues, expenses, companies      │
└─────────────────────────────────────────────┘
```

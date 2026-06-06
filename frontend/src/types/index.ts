// ==========================================
// TIPAGENS CENTRALIZADAS - Frontend
// Espelham as entidades do backend NestJS
// ==========================================

// ---- TAREFAS (Tasks) ----
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

// Mapa de tradução: Backend EN → Frontend PT
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Progresso',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
};

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

// ---- AGENDA (Events) ----
export type AgendaCategory = 'MEETING' | 'HEARING' | 'DEADLINE' | 'TASK' | 'OTHER';

export const AGENDA_CATEGORY_LABELS: Record<AgendaCategory, string> = {
  MEETING: 'Reunião',
  HEARING: 'Audiência',
  DEADLINE: 'Prazo',
  TASK: 'Tarefa',
  OTHER: 'Outros',
};

export const AGENDA_CATEGORY_COLORS: Record<AgendaCategory, string> = {
  MEETING: 'bg-blue-600',
  HEARING: 'bg-purple-600',
  DEADLINE: 'bg-red-600',
  TASK: 'bg-green-600',
  OTHER: 'bg-slate-400',
};

export interface AgendaEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  category: AgendaCategory;
  location?: string;
  description?: string;
  userId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// ---- RECEITAS (Revenues) ----
export type RevenuePaymentMethod = 'PIX' | 'BOLETO' | 'TRANSFER' | 'CREDIT_CARD' | 'CASH';
export type RevenueStatus = 'PENDING' | 'PAID' | 'CANCELED';

export const REVENUE_METHOD_LABELS: Record<RevenuePaymentMethod, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto Bancário',
  TRANSFER: 'Transferência',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
};

export const REVENUE_STATUS_LABELS: Record<RevenueStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELED: 'Cancelado',
};

export interface Revenue {
  id: string;
  clientName: string;
  clientId?: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: RevenuePaymentMethod;
  status: RevenueStatus;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// ---- DESPESAS (Expenses) ----
export type ExpensePaymentMethod = 'PIX' | 'BOLETO' | 'TRANSFER' | 'CREDIT_CARD' | 'CASH';
export type ExpenseStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export const EXPENSE_METHOD_LABELS: Record<ExpensePaymentMethod, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto Bancário',
  TRANSFER: 'Transferência',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
};

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
};

export interface Expense {
  id: string;
  supplierName: string;
  supplierId?: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: ExpensePaymentMethod;
  status: ExpenseStatus;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// ---- CONTATOS / CLIENTES (Clients) ----
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

// ---- USUÁRIOS / ACESSOS (Users) ----
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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

// ---- PROCESSOS (Processes) ----
export type ProcessStatus = 'ATIVO' | 'SUSPENSO' | 'ARQUIVADO' | 'ENCERRADO';

export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
  ATIVO: 'Ativo',
  SUSPENSO: 'Suspenso',
  ARQUIVADO: 'Arquivado',
  ENCERRADO: 'Encerrado',
};

export interface ProcessUser {
  id: string;
  processId: string;
  userId: string;
  user?: User;
}

export interface Process {
  id: string;
  cnj: string;
  title: string;
  description?: string;
  status: ProcessStatus;
  tribunal?: string;
  vara?: string;
  clientId?: string;
  createdById: string;
  companyId: string;
  processUsers: ProcessUser[];
  createdAt: string;
  updatedAt: string;
}

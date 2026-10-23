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

// ---- FINANCEIRO (Financial) ----
export type FinancialType = 'REVENUE' | 'EXPENSE';
export type FinancialPaymentMethod = 'PIX' | 'BOLETO' | 'TRANSFER' | 'CREDIT_CARD' | 'CASH';
export type FinancialStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';

export const FINANCIAL_TYPE_LABELS: Record<FinancialType, string> = {
  REVENUE: 'Receita',
  EXPENSE: 'Despesa',
};

export const FINANCIAL_METHOD_LABELS: Record<FinancialPaymentMethod, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto Bancário',
  TRANSFER: 'Transferência',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
};

export const FINANCIAL_STATUS_LABELS: Record<FinancialStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
  CANCELED: 'Cancelado',
};

export interface FinancialRecord {
  id: string;
  type: FinancialType;
  personName: string;
  personId?: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: FinancialPaymentMethod;
  status: FinancialStatus;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// Aliases mantidos para compatibilidade se necessário
export type RevenuePaymentMethod = FinancialPaymentMethod;
export type RevenueStatus = FinancialStatus;
export const REVENUE_METHOD_LABELS = FINANCIAL_METHOD_LABELS;
export const REVENUE_STATUS_LABELS = FINANCIAL_STATUS_LABELS;
export type Revenue = FinancialRecord;

export type ExpensePaymentMethod = FinancialPaymentMethod;
export type ExpenseStatus = FinancialStatus;
export const EXPENSE_METHOD_LABELS = FINANCIAL_METHOD_LABELS;
export const EXPENSE_STATUS_LABELS = FINANCIAL_STATUS_LABELS;
export type Expense = FinancialRecord;

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
  adverseParty?: string;
  createdById: string;
  companyId: string;
  processUsers: ProcessUser[];
  createdAt: string;
  updatedAt: string;
}

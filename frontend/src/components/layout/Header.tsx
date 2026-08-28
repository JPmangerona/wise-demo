'use client';

import { usePathname } from 'next/navigation';
import { Bell, Plus } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const getHeaderInfo = (path: string | null) => {
    switch (path) {
      case '/usuarios':
        return {
          title: 'Usuários',
          cat: 'Geral',
          sub: 'Controle',
          actionText: 'Novo Usuário',
          actionStyle: 'bg-gradient-to-r from-primary to-primary-dim text-white'
        };
      case '/clientes':
        return {
          title: 'Clientes',
          cat: 'Clientes',
          sub: 'Gestão',
          actionText: 'Novo Cliente',
          actionStyle: 'bg-blue-600 hover:bg-blue-500 text-white'
        };
      case '/receita':
        return {
          title: 'Receitas',
          cat: 'Financeiro',
          sub: 'Entradas',
          actionText: 'Lançar Receita',
          actionStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white'
        };
      case '/despesa':
        return {
          title: 'Despesas',
          cat: 'Financeiro',
          sub: 'Saídas',
          actionText: 'Lançar Despesa',
          actionStyle: 'bg-red-600 hover:bg-red-500 text-white'
        };
      case '/relatorios':
        return {
          title: 'Relatórios Financeiros',
          cat: 'Financeiro',
          sub: 'Análise',
          actionText: 'Exportar PDF',
          actionStyle: 'bg-slate-800 hover:bg-slate-700 text-white'
        };
      case '/tarefa':
        return {
          title: 'Tarefas',
          cat: 'Operacional',
          sub: 'Demandas',
          actionText: 'Nova Tarefa',
          actionStyle: 'bg-blue-900 hover:bg-blue-800 text-white'
        };
      case '/processos':
        return {
          title: 'Processos',
          cat: 'Operacional',
          sub: 'Gestão Legal',
          actionText: 'Novo Processo',
          actionStyle: 'bg-blue-900 hover:bg-blue-800 text-white'
        };
      case '/agenda':
        return {
          title: 'Agenda',
          cat: 'Operacional',
          sub: 'Compromissos',
          actionText: 'Novo Evento',
          actionStyle: 'bg-blue-900 hover:bg-blue-800 text-white'
        };
      case '/movimentacoes':
        return {
          title: 'Movimentações',
          cat: 'Operacional',
          sub: 'Andamentos',
          actionText: null,
          actionStyle: null
        };
      case '/dashboard':
      default:
        return {
          title: 'Visão Geral',
          cat: 'Dashboard',
          sub: 'Resumo',
          actionText: null,
          actionStyle: null
        };
    }
  };

  const { title, cat, sub, actionText, actionStyle } = getHeaderInfo(pathname);

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 font-headline">{title}</h2>
        <div className="h-4 w-[1px] bg-slate-200"></div>
        <nav className="flex gap-2">
          <span className="text-xs font-medium text-on-surface-variant px-2 py-1 bg-surface-container-low rounded">{cat}</span>
          <span className="text-xs font-medium text-slate-900 px-2 py-1 bg-primary-container rounded">{sub}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        {actionText && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-new-modal'))}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all scale-95 active:scale-90 ${actionStyle}`}
          >
            <Plus className="w-[18px] h-[18px]" />
            {actionText}
          </button>
        )}
      </div>
    </header>
  );
}

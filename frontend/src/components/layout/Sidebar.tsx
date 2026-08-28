'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  TrendingUp,
  TrendingDown,
  CheckSquare,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Contact,
  Scale,
  ArrowBigUpDash,
  ArrowBigDownDash,
  ChartNoAxesCombined
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/agenda', label: 'Agenda', icon: Calendar, category: 'Operacional' },
    { href: '/tarefa', label: 'Tarefa', icon: CheckSquare, category: 'Operacional' },
    { href: '/processos', label: 'Processos', icon: Scale, category: 'Operacional' },
    { href: '/movimentacoes', label: 'Movimentações', icon: FileText, category: 'Operacional' },
    // { href: '/usuarios', label: 'Usuários', icon: Contact, category: 'Contatos' },
    { href: '/clientes', label: 'Clientes', icon: Users, category: 'Contatos' },
    // { href: '/relatorios', label: 'Relatórios', icon: ChartNoAxesCombined, category: 'Financeiro' },
    { href: '/receita', label: 'Receita', icon: ArrowBigUpDash, category: 'Financeiro' },
    { href: '/despesa', label: 'Despesa', icon: ArrowBigDownDash, category: 'Financeiro' },
  ];

  return (
    <aside className={`h-screen fixed left-0 top-0 border-r border-slate-100 bg-slate-50 flex flex-col py-6 z-50 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-sm z-50 cursor-pointer hover:scale-105 active:scale-95 transition-all outline-none"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Header / Logo */}
      <div className={`px-4 mb-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start px-6'}`}>
        {isCollapsed ? (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
            W
          </div>
        ) : (
          <div>
            <h1 className="font-headline font-bold text-slate-900 text-xl tracking-tighter">Wise App</h1>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">Management System</p>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
        {['Operacional', 'Contatos', 'Financeiro'].map((cat) => {
          const items = menuItems.filter(item => item.category === cat);
          return (
            <div key={cat} className="space-y-1">
              {!isCollapsed && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/70 px-3 mb-2">
                  {cat}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${isActive
                          ? 'bg-slate-100 font-semibold text-slate-900 border-l-2 border-slate-900 rounded-l-none'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          } ${isCollapsed ? 'justify-center px-0' : ''}`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-900'}`} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer / Profile */}
      <div className="px-3 mt-auto space-y-1">
        {/* 
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors group ${isCollapsed ? 'justify-center px-0' : ''}`}
          title={isCollapsed ? 'Configurações' : undefined}
        >
          <Settings className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-slate-900" />
          {!isCollapsed && <span>Configurações</span>}
        </Link>
        */}

        <div className={`pt-4 mt-4 border-t border-slate-200 flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            JD
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">João da Silva</p>
              <p className="text-[10px] text-on-surface-variant truncate">Administrador</p>
            </div>
          )}
          {!isCollapsed && (
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors" title="Sair">
              <LogOut className="w-[18px] h-[18px]" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

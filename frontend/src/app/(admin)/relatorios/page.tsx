'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Download, Filter, FileText } from 'lucide-react';
import api from '@/services/api';
import { Revenue, Expense, EXPENSE_METHOD_LABELS } from '@/types';

const formatCurrency = (val: number) =>
  val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const monthNamesAbbr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function RelatoriosPage() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('Este Ano');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [revRes, expRes] = await Promise.all([
          api.get('/revenues'),
          api.get('/expenses'),
        ]);
        setRevenues(revRes.data || []);
        setExpenses(expRes.data || []);
      } catch (err) {
        console.error('Erro ao carregar dados de relatórios:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  // Totais globais
  const totalReceitas = revenues.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalDespesas = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const resultadoLiquido = totalReceitas - totalDespesas;
  const margem = totalReceitas > 0 ? (resultadoLiquido / totalReceitas) * 100 : 0;

  // Cálculo de fluxo de caixa dos últimos 6 meses
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const label = `${monthNamesAbbr[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;

    const monthRevenues = revenues
      .filter((r) => r.date && r.date.startsWith(monthKey))
      .reduce((acc, r) => acc + Number(r.amount || 0), 0);

    const monthExpenses = expenses
      .filter((e) => e.date && e.date.startsWith(monthKey))
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);

    return {
      label,
      revenues: monthRevenues,
      expenses: monthExpenses,
      profit: monthRevenues - monthExpenses,
    };
  });

  const maxMonthlyVal = Math.max(
    ...monthlyData.map((m) => Math.max(m.revenues, m.expenses, 1))
  );

  // Despesas por método de pagamento
  const expenseByMethodMap: Record<string, number> = {};
  expenses.forEach((exp) => {
    const label = EXPENSE_METHOD_LABELS[exp.paymentMethod] || exp.paymentMethod || 'Outros';
    expenseByMethodMap[label] = (expenseByMethodMap[label] || 0) + Number(exp.amount || 0);
  });

  const methodColors: Record<string, string> = {
    Boleto: 'bg-blue-500',
    Pix: 'bg-emerald-500',
    'Cartão de Crédito': 'bg-purple-500',
    'Transferência Bancária': 'bg-amber-500',
    Dinheiro: 'bg-slate-500',
    Outros: 'bg-slate-400',
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Filtros e periódo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Filtros de Período</h3>
            <p className="text-xs text-slate-500">Visualização de dados consolidados do backend</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-4 py-2 text-slate-700 outline-none focus:border-blue-500 w-full sm:w-auto cursor-pointer"
          >
            <option>Este Ano</option>
            <option>Últimos 6 Meses</option>
          </select>
          <button
            onClick={() => window.print()}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Cards KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receita Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Receitas</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">
                R$ {formatCurrency(totalReceitas)}
              </h3>
            </div>
            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              {revenues.length} faturas
            </span>
            <span>registradas no sistema</span>
          </div>
        </div>

        {/* Despesa Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownRight className="w-24 h-24 text-red-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Despesas</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">
                R$ {formatCurrency(totalDespesas)}
              </h3>
            </div>
            <div className="bg-red-100 p-2.5 rounded-xl text-red-600">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md">
              {expenses.length} lançamentos
            </span>
            <span>registrados no sistema</span>
          </div>
        </div>

        {/* Lucro Card */}
        <div className={`p-6 rounded-2xl shadow-xs text-white relative overflow-hidden ${resultadoLiquido >= 0 ? 'bg-slate-900' : 'bg-red-900'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-24 h-24 text-white" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Resultado Líquido</p>
              <h3 className="text-3xl font-extrabold font-headline">
                R$ {formatCurrency(resultadoLiquido)}
              </h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-xs">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs relative z-10">
            <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded-md">
              Margem: {margem.toFixed(1)}%
            </span>
            <span className="text-white/70 ml-2">
              {resultadoLiquido >= 0 ? 'Positivo' : 'Déficit'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Fluxo de Caixa Mensal Real */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <FileText className="w-5 h-5 text-slate-400" />
              Fluxo de Caixa Mensal (Últimos 6 Meses)
            </h3>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
            <div className="absolute w-full border-t border-slate-100 border-dashed top-1/2 -z-10"></div>

            {monthlyData.map((m, i) => {
              const revPercent = Math.min(Math.round((m.revenues / maxMonthlyVal) * 100), 100);
              const expPercent = Math.min(Math.round((m.expenses / maxMonthlyVal) * 100), 100);

              return (
                <div key={i} className="w-full flex flex-col justify-end items-center gap-1 group">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    {/* Barra Receita */}
                    <div
                      className="w-4 bg-emerald-500 rounded-t-xs transition-all hover:bg-emerald-600"
                      style={{ height: `${Math.max(revPercent, 4)}%` }}
                      title={`Receitas em ${m.label}: R$ ${formatCurrency(m.revenues)}`}
                    ></div>
                    {/* Barra Despesa */}
                    <div
                      className="w-4 bg-red-400 rounded-t-xs transition-all hover:bg-red-500"
                      style={{ height: `${Math.max(expPercent, 4)}%` }}
                      title={`Despesas em ${m.label}: R$ ${formatCurrency(m.expenses)}`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold mt-2">{m.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span>Despesas</span>
            </div>
          </div>
        </div>

        {/* Despesas por Método/Categoria */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
          <h3 className="font-bold text-slate-800 mb-6 text-sm">Despesas por Método de Pagamento</h3>
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-12">Carregando métricas...</p>
          ) : Object.keys(expenseByMethodMap).length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-1">
              <p className="text-xs font-medium">Nenhuma despesa cadastrada no sistema.</p>
              <p className="text-[11px]">Cadastre despesas na aba Despesas para visualizar os gráficos.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(expenseByMethodMap).map(([method, amount]) => {
                const percent = totalDespesas > 0 ? (amount / totalDespesas) * 100 : 0;
                const barColor = methodColors[method] || 'bg-slate-600';
                return (
                  <div key={method}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{method}</span>
                      <span className="font-bold text-slate-900">
                        R$ {formatCurrency(amount)} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`${barColor} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(percent, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


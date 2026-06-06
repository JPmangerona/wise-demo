import { ArrowUpRight, ArrowDownRight, DollarSign, Download, Filter, FileText } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Filters and Date Range */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Filtros de Período</h3>
            <p className="text-xs text-slate-500">Selecione o intervalo para análise</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-4 py-2 text-slate-700 outline-none focus:border-primary w-full sm:w-auto">
            <option>Este Mês</option>
            <option>Mês Anterior</option>
            <option>Últimos 3 Meses</option>
            <option>Este Ano</option>
            <option>Personalizado...</option>
          </select>
          <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receita Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Receitas</p>
              <h3 className="text-3xl font-bold text-slate-800">R$ 45.230,00</h3>
            </div>
            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-600 font-semibold flex items-center bg-emerald-50 px-2 py-0.5 rounded-md">
              +12.5%
            </span>
            <span className="text-slate-400">vs mês anterior</span>
          </div>
        </div>

        {/* Despesa Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownRight className="w-24 h-24 text-error" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Despesas</p>
              <h3 className="text-3xl font-bold text-slate-800">R$ 18.450,00</h3>
            </div>
            <div className="bg-red-100 p-2.5 rounded-xl text-error">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-error font-semibold flex items-center bg-red-50 px-2 py-0.5 rounded-md">
              +4.2%
            </span>
            <span className="text-slate-400">vs mês anterior</span>
          </div>
        </div>

        {/* Lucro Card */}
        <div className="bg-gradient-to-br from-primary to-primary-dim p-6 rounded-2xl shadow-md text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-24 h-24 text-white" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-white/80 uppercase tracking-wider mb-1">Resultado Líquido</p>
              <h3 className="text-3xl font-bold">R$ 26.780,00</h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="bg-white/20 text-white font-semibold px-2 py-0.5 rounded-md">
              Margem: 59.2%
            </span>
            <span className="text-white/70 ml-2">Excelente</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder para Gráfico de Barras */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Fluxo de Caixa Mensal
            </h3>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
            {/* Linha guia */}
            <div className="absolute w-full border-t border-slate-100 border-dashed top-1/2 -z-10"></div>
            
            {/* Barras mockup */}
            {[40, 60, 45, 80, 50, 95].map((h, i) => (
              <div key={i} className="w-full flex flex-col justify-end items-center gap-1 group">
                <div 
                  className="w-full max-w-[40px] bg-emerald-100 group-hover:bg-emerald-200 transition-colors rounded-t-sm" 
                  style={{ height: `${h}%` }}
                >
                  <div className="w-full bg-emerald-500 rounded-t-sm transition-all" style={{ height: `${h * 0.4}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Mês {i+1}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-100"></span>
              <span>Lucro Projetado</span>
            </div>
          </div>
        </div>

        {/* Despesas por Categoria */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6">Despesas por Categoria</h3>
          <div className="space-y-5">
            {/* Item 1 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Folha de Pagamento</span>
                <span className="font-bold text-slate-900">R$ 8.500,00</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            {/* Item 2 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Impostos & Taxas</span>
                <span className="font-bold text-slate-900">R$ 4.200,00</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            {/* Item 3 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Infraestrutura (SaaS, Nuvem)</span>
                <span className="font-bold text-slate-900">R$ 3.100,00</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
            {/* Item 4 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Marketing & Vendas</span>
                <span className="font-bold text-slate-900">R$ 2.650,00</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

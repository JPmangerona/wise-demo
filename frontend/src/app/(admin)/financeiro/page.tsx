'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Search, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Wallet, Plus, Filter } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import {
  FinancialRecord,
  FinancialType,
  FinancialPaymentMethod,
  FinancialStatus,
  FINANCIAL_TYPE_LABELS,
  FINANCIAL_METHOD_LABELS,
  FINANCIAL_STATUS_LABELS
} from '@/types';

// ---- Helpers de formatação ----
const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDateToBR = (isoDate: string) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

const formatDateToISO = (brDate: string) => {
  if (!brDate) return '';
  const [d, m, y] = brDate.split('/');
  return `${y}-${m}-${d}`;
};

const maskDate = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 8);
  if (v.length <= 2) return v;
  if (v.length <= 4) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
};

const maskCurrency = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (!v) return '';
  return (Number(v) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const isValidCalendarDate = (brDate: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(brDate)) return false;
  const [d, m, y] = brDate.split('/').map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
};

interface FinancialForm {
  type: FinancialType;
  personName: string;
  description: string;
  amount: string;
  date: string;
  paymentMethod: FinancialPaymentMethod;
  status: FinancialStatus;
}

const emptyForm: FinancialForm = {
  type: 'REVENUE',
  personName: '',
  description: '',
  amount: '',
  date: '',
  paymentMethod: 'PIX',
  status: 'PENDING',
};

export default function FinanceiroPage() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [formData, setFormData] = useState<FinancialForm>(emptyForm);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ personName?: string; amount?: string; date?: string }>({});

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/financial');
      setRecords(data || []);
    } catch (err) {
      console.error('Erro ao buscar lançamentos financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchRecords();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingRecord(null);
      setFormData(emptyForm);
      setErrorMsg(null);
      setFieldErrors({});
      setIsModalOpen(true);
    };
    window.addEventListener('open-new-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-modal', handleOpenModal);
  }, []);

  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      personName: record.personName,
      description: record.description,
      amount: formatCurrency(Number(record.amount)),
      date: formatDateToBR(record.date),
      paymentMethod: record.paymentMethod,
      status: record.status,
    });
    setErrorMsg(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setErrorMsg(null);
      setFieldErrors({});

      const errors: { personName?: string; amount?: string; date?: string } = {};
      if (!formData.personName || !formData.personName.trim()) {
        errors.personName = formData.type === 'REVENUE' ? 'O nome do cliente é obrigatório.' : 'O nome do fornecedor é obrigatório.';
      }
      if (!formData.amount || !formData.amount.trim()) {
        errors.amount = 'O valor é obrigatório.';
      }
      if (!formData.date || !formData.date.trim()) {
        errors.date = 'A data é obrigatória.';
      } else if (!isValidCalendarDate(formData.date)) {
        errors.date = 'Digite uma data de calendário válida (DD/MM/AAAA).';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      const payload = {
        type: formData.type,
        personName: formData.personName,
        description: formData.description,
        amount: parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')) || 0,
        date: formatDateToISO(formData.date),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
      };

      if (editingRecord) {
        await api.put(`/financial/${editingRecord.id}`, payload);
      } else {
        await api.post('/financial', payload);
      }

      setIsModalOpen(false);
      fetchRecords();
    } catch (err: any) {
      console.warn('Erro ao salvar lançamento financeiro:', err.response?.data?.message || err.message);
      const backendMsg = err.response?.data?.message;
      if (Array.isArray(backendMsg)) {
        setErrorMsg(backendMsg.join('. '));
      } else {
        setErrorMsg(backendMsg || 'Erro ao salvar lançamento financeiro.');
      }
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (deletingId) {
        await api.delete(`/financial/${deletingId}`);
      }
      setIsDeleteModalOpen(false);
      fetchRecords();
    } catch (err) {
      console.error('Erro ao excluir lançamento:', err);
    }
  };

  // Cálculos consolidados
  const totalReceitas = records
    .filter((r) => r.type === 'REVENUE')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalDespesas = records
    .filter((r) => r.type === 'EXPENSE')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  const aReceber = records
    .filter((r) => r.type === 'REVENUE' && r.status === 'PENDING')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const aPagar = records
    .filter((r) => r.type === 'EXPENSE' && r.status === 'PENDING')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Filtragem da tabela
  const filteredRecords = records.filter((rec) => {
    // Filtros por dropdown/search
    const matchesType = filterType ? rec.type === filterType : true;
    const matchesMethod = filterMethod ? rec.paymentMethod === filterMethod : true;
    const matchesStatus = filterStatus ? rec.status === filterStatus : true;

    const matchesSearch =
      rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesMethod && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">


      {/* Cards KPI / Resumo Financeiro */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receitas Card */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group border border-slate-100 shadow-xs">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Receitas</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">R$ {formatCurrency(totalReceitas)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">R$ {formatCurrency(aReceber)}</span> pendentes a receber
          </p>
        </div>

        {/* Despesas Card */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group border border-slate-100 shadow-xs">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Despesas</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">R$ {formatCurrency(totalDespesas)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-red-600 font-bold">R$ {formatCurrency(aPagar)}</span> contas a pagar
          </p>
        </div>

        {/* Saldo Líquido Card */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group border border-slate-100 shadow-xs">
          <div className={`absolute top-0 left-0 w-1 h-full ${saldoLiquido >= 0 ? 'bg-slate-900' : 'bg-red-600'}`}></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Saldo Líquido</p>
              <h3 className={`text-3xl font-extrabold font-headline ${saldoLiquido >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                R$ {formatCurrency(saldoLiquido)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            {saldoLiquido >= 0 ? 'Balanço financeiro positivo' : 'Déficit financeiro no período'}
          </p>
        </div>
      </section>

      {/* Busca e Filtros */}
      <section className="bg-surface-container-low p-6 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400 outline-none text-slate-800"
              placeholder="Buscar cliente, fornecedor ou descrição..."
              type="text"
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 transition-all text-slate-700 outline-none"
            >
              <option value="">Todos os Tipos (Receita / Despesa)</option>
              <option value="REVENUE">Receita (Entrada)</option>
              <option value="EXPENSE">Despesa (Saída)</option>
            </select>
          </div>

          <div>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 transition-all text-slate-700 outline-none"
            >
              <option value="">Todos os Métodos</option>
              {Object.entries(FINANCIAL_METHOD_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 transition-all text-slate-700 outline-none"
            >
              <option value="">Todos os Status</option>
              {Object.entries(FINANCIAL_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tabela de Lançamentos Financeiros */}
      <section className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Pessoa / Cliente / Fornecedor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Método</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Data</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Valor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Carregando lançamentos financeiros...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Nenhum lançamento financeiro encontrado.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      {record.type === 'REVENUE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ArrowUpRight className="w-3 h-3" /> Receita
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <ArrowDownRight className="w-3 h-3" /> Despesa
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800 block">{record.personName}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 block">{record.description}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {FINANCIAL_METHOD_LABELS[record.paymentMethod] || record.paymentMethod}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {formatDateToBR(record.date)}
                    </td>

                    <td className={`px-6 py-4 text-right font-bold text-sm ${
                      record.type === 'REVENUE' ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {record.type === 'REVENUE' ? '+' : '-'} R$ {formatCurrency(Number(record.amount))}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${
                        record.status === 'PAID'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : record.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : record.status === 'OVERDUE'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {FINANCIAL_STATUS_LABELS[record.status] || record.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-slate-100"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(record.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-slate-100"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Criar / Editar Lançamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
      >
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Seleção do Tipo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tipo de Lançamento</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'REVENUE' })}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  formData.type === 'REVENUE'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> Receita (Entrada)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  formData.type === 'EXPENSE'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" /> Despesa (Saída)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {formData.type === 'REVENUE' ? 'Cliente' : 'Fornecedor'}
            </label>
            <input
              type="text"
              value={formData.personName}
              onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
              placeholder={formData.type === 'REVENUE' ? 'Nome do cliente' : 'Nome do fornecedor'}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
            />
            {fieldErrors.personName && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.personName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do serviço ou produto"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: maskCurrency(e.target.value) })}
                placeholder="0,00"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
              />
              {fieldErrors.amount && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: maskDate(e.target.value) })}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
              />
              {fieldErrors.date && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.date}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pagamento</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as FinancialPaymentMethod })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
              >
                {Object.entries(FINANCIAL_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as FinancialStatus })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
              >
                {Object.entries(FINANCIAL_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer ${
                formData.type === 'REVENUE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Excluir Lançamento */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Lançamento">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Deseja mesmo apagar este lançamento financeiro?</p>
          <div className="pt-4 flex justify-end gap-2 border-t mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

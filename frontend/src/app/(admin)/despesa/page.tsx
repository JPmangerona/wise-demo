'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, DollarSign, ShieldAlert, Search, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import { Expense, ExpensePaymentMethod, ExpenseStatus, EXPENSE_METHOD_LABELS, EXPENSE_STATUS_LABELS } from '@/types';

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

interface ExpenseForm {
  supplierName: string;
  description: string;
  amount: string;
  date: string; // DD/MM/YYYY no form
  paymentMethod: ExpensePaymentMethod;
  status: ExpenseStatus;
}

const emptyForm: ExpenseForm = {
  supplierName: '', description: '', amount: '', date: '',
  paymentMethod: 'BOLETO', status: 'PENDING',
};

export default function Despesas() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState<ExpenseForm>(emptyForm);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchExpenses();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingExp(null);
      setFormData(emptyForm);
      setIsModalOpen(true);
    };
    window.addEventListener('open-new-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-modal', handleOpenModal);
  }, []);

  const handleEdit = (exp: Expense) => {
    setEditingExp(exp);
    setFormData({
      supplierName: exp.supplierName,
      description: exp.description,
      amount: formatCurrency(Number(exp.amount)),
      date: formatDateToBR(exp.date),
      paymentMethod: exp.paymentMethod,
      status: exp.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        supplierName: formData.supplierName,
        description: formData.description,
        amount: parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')) || 0,
        date: formatDateToISO(formData.date),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
      };
      if (editingExp) {
        await api.put(`/expenses/${editingExp.id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (err) {
      console.error('Erro ao salvar despesa:', err);
    }
  };

  const confirmDelete = (id: string) => { setDeletingId(id); setIsDeleteModalOpen(true); };

  const handleDelete = async () => {
    try {
      if (deletingId) await api.delete(`/expenses/${deletingId}`);
      setIsDeleteModalOpen(false);
      fetchExpenses();
    } catch (err) {
      console.error('Erro ao excluir despesa:', err);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch =
      exp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = filterMethod ? exp.paymentMethod === filterMethod : true;
    const matchesStatus = filterStatus ? exp.status === filterStatus : true;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalPago = expenses.filter(e => e.status === 'PAID').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const aPagar = expenses.filter(e => e.status === 'PENDING').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const atrasado = expenses.filter(e => e.status === 'OVERDUE').reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Cards Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Despesas Pagas</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">R$ {formatCurrency(totalPago)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center text-error">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Contas a Pagar</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">R$ {formatCurrency(aPagar)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant">{expenses.filter(e => e.status === 'PENDING').length} despesas pendentes</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Valores em Atraso</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">R$ {formatCurrency(atrasado)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-surface-container-low p-6 rounded-xl border border-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50 outline-none text-slate-800"
              placeholder="Buscar por fatura, fornecedor ou descrição..."
              type="text"
            />
          </div>
          <div>
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 outline-none"
            >
              <option value="">Todos os Métodos</option>
              {Object.entries(EXPENSE_METHOD_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 outline-none"
            >
              <option value="">Todos os Status</option>
              {Object.entries(EXPENSE_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Expenses Table */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Lançamento / Descrição</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Fornecedor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Método</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Vencimento</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Valor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Carregando despesas...</td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhuma despesa encontrada.</td></tr>
              ) : filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 block">{exp.id.substring(0, 8).toUpperCase()}</span>
                    <span className="text-[10px] text-on-surface-variant">{exp.description}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">{exp.supplierName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{EXPENSE_METHOD_LABELS[exp.paymentMethod] || exp.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDateToBR(exp.date)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-sm text-slate-900">
                    R$ {formatCurrency(Number(exp.amount))}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${
                      exp.status === 'PAID'
                        ? 'bg-green-50 text-green-700'
                        : exp.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                    }`}>
                      {EXPENSE_STATUS_LABELS[exp.status] || exp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(exp)} className="p-2 text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(exp.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExp ? 'Editar Despesa' : 'Nova Despesa'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor</label>
            <input type="text" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input type="text" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
              <input type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} placeholder="DD/MM/YYYY" className="w-full px-4 py-2 border rounded-lg outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Método</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as ExpensePaymentMethod})} className="w-full px-4 py-2 border rounded-lg outline-none">
                {Object.entries(EXPENSE_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ExpenseStatus})} className="w-full px-4 py-2 border rounded-lg outline-none">
                {Object.entries(EXPENSE_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t mt-6">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-red-600 text-white rounded-lg">Salvar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Lançamento">
        <div className="space-y-4">
          <p className="text-slate-600">Deseja mesmo apagar este lançamento?</p>
          <div className="pt-4 flex justify-end gap-2 border-t mt-6">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

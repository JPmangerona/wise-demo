'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, Search, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import { Revenue, RevenuePaymentMethod, RevenueStatus, REVENUE_METHOD_LABELS, REVENUE_STATUS_LABELS } from '@/types';

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

// ---- Tipo do formulário (dados que o front envia ao back) ----
interface RevenueForm {
  clientName: string;
  description: string;
  amount: string; // String no form, convertemos para number ao salvar
  date: string; // DD/MM/YYYY no form
  paymentMethod: RevenuePaymentMethod;
  status: RevenueStatus;
}

const emptyForm: RevenueForm = {
  clientName: '', description: '', amount: '', date: '',
  paymentMethod: 'PIX', status: 'PENDING',
};

export default function Receitas() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRev, setEditingRev] = useState<Revenue | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState<RevenueForm>(emptyForm);

  // ---- Buscar dados do backend ----
  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/revenues');
      setRevenues(data);
    } catch (err) {
      console.error('Erro ao buscar receitas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchRevenues();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingRev(null);
      setFormData(emptyForm);
      setIsModalOpen(true);
    };
    window.addEventListener('open-new-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-modal', handleOpenModal);
  }, []);

  const handleEdit = (rev: Revenue) => {
    setEditingRev(rev);
    setFormData({
      clientName: rev.clientName,
      description: rev.description,
      amount: formatCurrency(Number(rev.amount)),
      date: formatDateToBR(rev.date),
      paymentMethod: rev.paymentMethod,
      status: rev.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        clientName: formData.clientName,
        description: formData.description,
        amount: parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')) || 0,
        date: formatDateToISO(formData.date),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
      };

      if (editingRev) {
        await api.put(`/revenues/${editingRev.id}`, payload);
      } else {
        await api.post('/revenues', payload);
      }
      setIsModalOpen(false);
      fetchRevenues(); // Recarrega a lista do backend
    } catch (err) {
      console.error('Erro ao salvar receita:', err);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (deletingId) {
        await api.delete(`/revenues/${deletingId}`);
      }
      setIsDeleteModalOpen(false);
      fetchRevenues();
    } catch (err) {
      console.error('Erro ao excluir receita:', err);
    }
  };

  const filteredRevenues = revenues.filter(rev => {
    const matchesSearch =
      rev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = filterMethod ? rev.paymentMethod === filterMethod : true;
    const matchesStatus = filterStatus ? rev.status === filterStatus : true;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalFaturamento = revenues.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const aReceber = revenues.filter(r => r.status === 'PENDING').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalPago = revenues.filter(r => r.status === 'PAID').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const adimplenciaRate = totalFaturamento > 0 ? (totalPago / totalFaturamento) * 100 : 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Cards Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Faturamento Total</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">R$ {formatCurrency(totalFaturamento)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant flex items-center gap-1">
            <span className="text-green-600 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> Atualizado</span> em tempo real
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">A Receber</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">R$ {formatCurrency(aReceber)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant">{revenues.filter(r => r.status === 'PENDING').length} faturas pendentes</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Taxa de Adimplência</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">{adimplenciaRate.toFixed(1)}%</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
              <Percent className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant">R$ {formatCurrency(totalPago)} recebidos com sucesso</p>
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
              placeholder="Buscar por fatura, cliente ou serviço..."
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
              {Object.entries(REVENUE_METHOD_LABELS).map(([key, label]) => (
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
              {Object.entries(REVENUE_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Revenues Table */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Fatura / Descrição</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Método</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Data</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Valor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Carregando receitas...</td></tr>
              ) : filteredRevenues.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhuma receita encontrada.</td></tr>
              ) : filteredRevenues.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 block">{rev.id.substring(0, 8).toUpperCase()}</span>
                    <span className="text-[10px] text-on-surface-variant">{rev.description}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">{rev.clientName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{REVENUE_METHOD_LABELS[rev.paymentMethod] || rev.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDateToBR(rev.date)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-sm text-slate-900">
                    R$ {formatCurrency(Number(rev.amount))}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${rev.status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                      {REVENUE_STATUS_LABELS[rev.status] || rev.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(rev)} className="p-2 text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(rev.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRev ? 'Editar Receita' : 'Nova Receita'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
            <input type="text" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input type="text" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input type="text" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} placeholder="DD/MM/YYYY" className="w-full px-4 py-2 border rounded-lg outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Método</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as RevenuePaymentMethod })} className="w-full px-4 py-2 border rounded-lg outline-none">
                {Object.entries(REVENUE_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as RevenueStatus })} className="w-full px-4 py-2 border rounded-lg outline-none">
                {Object.entries(REVENUE_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t mt-6">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Salvar</button>
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

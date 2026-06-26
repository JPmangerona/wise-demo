'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Scale, Edit2, Search, Trash2, FolderOpen, Activity, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import { User, Client, Process, ProcessStatus, PROCESS_STATUS_LABELS } from '@/types';

// ---- Formulário ----
interface ProcessForm {
  cnj: string;
  title: string;
  status: ProcessStatus | '';
  tribunal: string;
  vara: string;
  description: string;
  clientId: string;
  userIds: string[];
}

const emptyForm: ProcessForm = {
  cnj: '',
  title: '',
  status: '',
  tribunal: '',
  vara: '',
  description: '',
  clientId: '',
  userIds: [],
};

export default function ProcessosPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState<ProcessForm>(emptyForm);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ cnj?: string; title?: string }>({});

  // ---- Fetch de dados ----
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, processesResponse, clientsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/processes'),
        api.get('/clients'),
      ]);
      setUsers(usersResponse.data);
      setProcesses(processesResponse.data);
      setClients(clientsResponse.data);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  // Listener para abrir modal de novo processo via evento externo (ex: botão do Header)
  useEffect(() => {
    const handleOpenModal = () => {
      setEditingProcess(null);
      setFormData(emptyForm);
      setErrorMsg(null);
      setFieldErrors({});
      setIsModalOpen(true);
    };

    window.addEventListener('open-new-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-modal', handleOpenModal);
  }, []);

  // ---- Helpers ----
  const getUserName = (id?: string) => users.find((u) => u.id === id)?.name || '-';
  const getClientName = (id?: string) => clients.find((c) => c.id === id)?.name || '-';

  // Extrai os nomes dos usuários vinculados ao processo via processUsers
  const getAssignedUserNames = (process: Process): string => {
    if (!process.processUsers || process.processUsers.length === 0) return '-';
    return process.processUsers
      .map((pu) => getUserName(pu.userId))
      .filter((name) => name !== '-')
      .join(', ') || '-';
  };

  // ---- Handlers ----
  const handleEdit = (process: Process) => {
    setEditingProcess(process);
    setFormData({
      cnj: process.cnj || '',
      title: process.title || '',
      status: process.status,
      tribunal: process.tribunal || '',
      vara: process.vara || '',
      description: process.description || '',
      clientId: process.clientId || '',
      userIds: process.processUsers?.map((pu) => pu.userId) || [],
    });
    setErrorMsg(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setErrorMsg(null);
      setFieldErrors({});

      const errors: { cnj?: string; title?: string } = {};
      if (!formData.cnj || !formData.cnj.trim()) {
        errors.cnj = 'O número do processo (CNJ) é obrigatório.';
      } else if (formData.cnj.length > 100) {
        errors.cnj = 'O número do processo (CNJ) não pode ter mais de 100 caracteres.';
      }

      if (!formData.title || !formData.title.trim()) {
        errors.title = 'O título / causa é obrigatório.';
      } else if (formData.title.length > 100) {
        errors.title = 'O título / causa não pode ter mais de 100 caracteres.';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      if (!formData.status) {
        setErrorMsg('Por favor, selecione um status.');
        return;
      }

      const payload = {
        cnj: formData.cnj,
        title: formData.title,
        status: formData.status,
        tribunal: formData.tribunal || undefined,
        vara: formData.vara || undefined,
        description: formData.description || undefined,
        clientId: formData.clientId || undefined,
        userIds: formData.userIds.length > 0 ? formData.userIds : undefined,
      };

      if (editingProcess) {
        await api.put(`/processes/${editingProcess.id}`, payload);
      } else {
        await api.post('/processes', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.warn('Erro ao salvar processo:', err.response?.data?.message || err.message);
      const backendMsg = err.response?.data?.message;
      if (Array.isArray(backendMsg)) {
        setErrorMsg(backendMsg.join('. '));
      } else {
        setErrorMsg(backendMsg || 'Erro ao salvar processo.');
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
        await api.delete(`/processes/${deletingId}`);
      }
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir processo:', err);
    }
  };

  const toggleUser = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId],
    }));
  };

  // ---- Filtro ----
  const filteredProcesses = processes.filter((process) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      process.title?.toLowerCase().includes(search) ||
      process.cnj?.toLowerCase().includes(search) ||
      process.tribunal?.toLowerCase().includes(search);
    const matchesStatus = filterStatus ? process.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* ---- Métricas ---- */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Metric title="Ativos" value={processes.filter(p => p.status === 'ATIVO').length} icon={<Activity className="w-6 h-6" />} color="bg-blue-500" />
        <Metric title="Suspensos" value={processes.filter(p => p.status === 'SUSPENSO').length} icon={<AlertCircle className="w-6 h-6" />} color="bg-amber-500" />
        <Metric title="Arquivados" value={processes.filter(p => p.status === 'ARQUIVADO').length} icon={<FolderOpen className="w-6 h-6" />} color="bg-slate-500" />
        <Metric title="Encerrados" value={processes.filter(p => p.status === 'ENCERRADO').length} icon={<CheckCircle2 className="w-6 h-6" />} color="bg-emerald-500" />
      </section>

      {/* ---- Barra de busca e filtro ---- */}
      <section className="bg-surface-container-low p-6 rounded-xl border border-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50 outline-none"
              placeholder="Buscar por número CNJ, título ou tribunal..."
              type="text"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all text-on-surface-variant outline-none"
          >
            <option value="">Todos os Status</option>
            {Object.entries(PROCESS_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ---- Tabela de processos ---- */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Número / Título</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tribunal / Vara</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cliente</th>
                {/* <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Responsáveis</th> */}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Carregando processos...</td></tr>
              ) : filteredProcesses.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum processo encontrado.</td></tr>
              ) : filteredProcesses.map((process) => (
                <tr key={process.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 block">{process.cnj || 'Sem Número'}</span>
                    <span className="text-xs text-slate-500">{process.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700 block">{process.tribunal || '-'}</span>
                    <span className="text-xs text-slate-500">{process.vara || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">{getClientName(process.clientId)}</span>
                  </td>
                  {/* <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">{getAssignedUserNames(process)}</span>
                  </td> */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight 
                      ${process.status === 'ATIVO' ? 'bg-blue-50 text-blue-700' : 
                        process.status === 'ENCERRADO' ? 'bg-emerald-50 text-emerald-700' : 
                        process.status === 'SUSPENSO' ? 'bg-amber-50 text-amber-700' : 
                        'bg-slate-100 text-slate-700'}`}>
                      {PROCESS_STATUS_LABELS[process.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(process)} className="p-2 text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(process.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- Modal Criar/Editar ---- */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsUserDropdownOpen(false); }} title={editingProcess ? 'Editar Processo' : 'Adicionar Novo Processo'}>
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
              {errorMsg}
            </div>
          )}
          {/* CNJ + Título */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número Processo (CNJ)</label>
              <input type="text" maxLength={100} value={formData.cnj} onChange={(e) => setFormData({ ...formData, cnj: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              {fieldErrors.cnj && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.cnj}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título / Causa</label>
              <input type="text" maxLength={100} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              {fieldErrors.title && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.title}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ProcessStatus })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
              <option value="" disabled>Selecione o status</option>
              {Object.entries(PROCESS_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {/* Tribunal + Vara */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tribunal</label>
              <input type="text" placeholder="Ex: TJPR, TRF4" value={formData.tribunal} onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vara</label>
              <input type="text" placeholder="Ex: 2ª Vara Cível" value={formData.vara} onChange={(e) => setFormData({ ...formData, vara: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente Vinculado</label>
            <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
              <option value="">Nenhum cliente vinculado</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.cpfCnpj ? ` — ${client.cpfCnpj}` : ''}</option>)}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea placeholder="Detalhes da causa..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-24 resize-y" />
          </div>

          {/* Responsáveis (Multi-select com checkboxes) */}
          {/* 
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Responsáveis pelo Processo</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-left flex items-center justify-between"
              >
                <span className="text-sm text-slate-700 truncate">
                  {formData.userIds.length === 0
                    ? 'Selecione os responsáveis...'
                    : formData.userIds.map((id) => getUserName(id)).join(', ')}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">Nenhum usuário cadastrado.</p>
                  ) : (
                    users.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.userIds.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-700">{user.name}</span>
                          <span className="text-xs text-slate-400">{user.email}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
            {formData.userIds.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">{formData.userIds.length} responsável(is) selecionado(s)</p>
            )}
          </div>
          */}

          <Actions onCancel={() => { setIsModalOpen(false); setIsUserDropdownOpen(false); }} onConfirm={handleSave} label="Salvar Processo" />
        </div>
      </Modal>

      {/* ---- Modal Excluir ---- */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Processo">
        <div className="space-y-4">
          <p className="text-slate-600">Deseja mesmo apagar este processo? Esta ação não poderá ser desfeita.</p>
          <Actions onCancel={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} label="Excluir Processo" destructive />
        </div>
      </Modal>
    </div>
  );
}

function Metric({ title, value, icon, color }: { title: string; value: number; icon: ReactNode; color: string }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 font-headline">{value.toString().padStart(2, '0')}</h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-primary">{icon}</div>
      </div>
    </div>
  );
}

function Actions({ onCancel, onConfirm, label, destructive = false }: { onCancel: () => void; onConfirm: () => void; label: string; destructive?: boolean }) {
  return (
    <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
      <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
      <button onClick={onConfirm} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${destructive ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>{label}</button>
    </div>
  );
}

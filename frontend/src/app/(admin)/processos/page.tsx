'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Scale,
  Edit2,
  Search,
  Trash2,
  FolderOpen,
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Plus,
  Calendar
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import { User, Client, Process, ProcessStatus, PROCESS_STATUS_LABELS } from '@/types';
import {
  getStoredProcessGroups,
  addMovementToProcessGroup,
  updateProcessGroupInfo,
  MOVEMENT_UPDATE_EVENT,
  ProcessGroup,
} from '@/services/movementStorage';

// ---- Formulário de Processo ----
interface ProcessForm {
  cnj: string;
  title: string;
  status: ProcessStatus | '';
  tribunal: string;
  vara: string;
  description: string;
  clientId: string;
  adverseParty: string;
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
  adverseParty: '',
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

  // ---- Estados do Modal de Movimentações ----
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);
  const [selectedProcessForMovements, setSelectedProcessForMovements] = useState<Process | null>(null);
  const [storedGroups, setStoredGroups] = useState<ProcessGroup[]>([]);

  const [newMovDate, setNewMovDate] = useState('08/25/2026, 10:35 AM');
  const [newMovOrigin, setNewMovOrigin] = useState('Manual');
  const [newMovDescription, setNewMovDescription] = useState('');

  const [syncingInfosimples, setSyncingInfosimples] = useState(false);
  const [syncingDatajud, setSyncingDatajud] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Carregar movimentações armazenadas
  useEffect(() => {
    const syncGroups = () => setStoredGroups(getStoredProcessGroups());
    syncGroups();

    window.addEventListener(MOVEMENT_UPDATE_EVENT, syncGroups);
    window.addEventListener('storage', syncGroups);
    return () => {
      window.removeEventListener(MOVEMENT_UPDATE_EVENT, syncGroups);
      window.removeEventListener('storage', syncGroups);
    };
  }, []);

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

  // Listener para abrir modal de novo processo via evento externo
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

  // ---- Handlers de Processos ----
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
      adverseParty: process.adverseParty || '',
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
        adverseParty: formData.adverseParty || undefined,
        userIds: formData.userIds.length > 0 ? formData.userIds : undefined,
      };

      let savedId = editingProcess?.id;
      if (editingProcess) {
        await api.put(`/processes/${editingProcess.id}`, payload);
      } else {
        const res = await api.post('/processes', payload);
        savedId = res.data?.id;
      }

      if (savedId) {
        updateProcessGroupInfo(savedId, {
          processName: formData.title || formData.cnj || 'Sem Título',
          clientName: getClientName(formData.clientId),
          adverseParty: formData.adverseParty || '-',
          courtCity: `${formData.tribunal || '-'} - ${formData.vara || '-'}`,
        });
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

  // ---- Handlers do Modal de Movimentações ----
  const openMovementsModal = (process: Process) => {
    setSelectedProcessForMovements(process);
    setStoredGroups(getStoredProcessGroups());

    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setNewMovDate(`${month}/${day}/${year}, ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`);
    setNewMovOrigin('Manual');
    setNewMovDescription('');
    setIsMovementsModalOpen(true);
  };

  const handleAddMovement = () => {
    if (!selectedProcessForMovements || !newMovDescription.trim()) return;

    const process = selectedProcessForMovements;
    const clientName = getClientName(process.clientId);
    const adverseParty = process.adverseParty || '-';
    const courtCity = `${process.tribunal || '-'} - ${process.vara || '-'}`;
    const processName = process.title || process.cnj || 'Sem Título';

    addMovementToProcessGroup(
      process.id,
      processName,
      clientName,
      adverseParty,
      courtCity,
      newMovDate || '08/25/2026, 10:35 AM',
      (newMovOrigin || 'MANUAL').toUpperCase() as any,
      newMovDescription.trim()
    );

    setNewMovDescription('');
  };

  const formatMovementDate = (dateStr: string): string => {
    let dateObj: Date;
    if (dateStr.includes('T')) {
      dateObj = new Date(dateStr);
    } else {
      const parts = dateStr.split(' ');
      if (parts.length < 2) return dateStr;
      const dateParts = parts[0].split('/');
      const timeParts = parts[1].split(':');
      if (dateParts.length < 3 || timeParts.length < 2) return dateStr;
      dateObj = new Date(
        parseInt(dateParts[2]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[0]),
        parseInt(timeParts[0]),
        parseInt(timeParts[1]),
        timeParts[2] ? parseInt(timeParts[2]) : 0
      );
    }
    if (isNaN(dateObj.getTime())) return dateStr;

    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${month}/${day}/${year}, ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const handleSyncInfosimples = async () => {
    if (!selectedProcessForMovements) return;
    const process = selectedProcessForMovements;

    setSyncingInfosimples(true);
    setSyncStatus('Consultando Infosimples...');
    try {
      const res = await api.get(`/processes/infosimples/${process.cnj}`);
      const movimentacoes = res.data?.movimentacoes || [];

      if (movimentacoes.length === 0) {
        setSyncStatus('Nenhuma movimentação encontrada na Infosimples.');
        setTimeout(() => setSyncStatus(null), 3000);
        return;
      }

      const clientName = getClientName(process.clientId);
      const adverseParty = process.adverseParty || '-';
      const courtCity = `${process.tribunal || '-'} - ${process.vara || '-'}`;
      const processName = process.title || process.cnj || 'Sem Título';

      const groups = getStoredProcessGroups();
      const group = groups.find(g => g.id === process.id);
      const existing = group?.movements || [];

      let importedCount = 0;
      const reversedMovs = [...movimentacoes].reverse();

      for (const m of reversedMovs) {
        const formattedDate = formatMovementDate(m.data || '');
        const desc = m.descricao || '';

        const isDuplicate = existing.some(em =>
          em.description.trim() === desc.trim() &&
          em.date === formattedDate
        );

        if (!isDuplicate) {
          addMovementToProcessGroup(
            process.id,
            processName,
            clientName,
            adverseParty,
            courtCity,
            formattedDate,
            'API_INFOSIMPLES',
            desc
          );
          importedCount++;
        }
      }

      setSyncStatus(`Sucesso! ${importedCount} novas movimentações importadas.`);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Erro: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setSyncStatus(null), 4000);
    } finally {
      setSyncingInfosimples(false);
    }
  };

  const handleSyncDatajud = async () => {
    if (!selectedProcessForMovements) return;
    const process = selectedProcessForMovements;

    setSyncingDatajud(true);
    setSyncStatus('Consultando DataJud...');
    try {
      const res = await api.get(`/processes/datajudi/${process.cnj}`);
      const movimentacoes = res.data?.movimentacoes || [];

      if (movimentacoes.length === 0) {
        setSyncStatus('Nenhuma movimentação encontrada no DataJud.');
        setTimeout(() => setSyncStatus(null), 3000);
        return;
      }

      const clientName = getClientName(process.clientId);
      const adverseParty = process.adverseParty || '-';
      const courtCity = `${process.tribunal || '-'} - ${process.vara || '-'}`;
      const processName = process.title || process.cnj || 'Sem Título';

      const groups = getStoredProcessGroups();
      const group = groups.find(g => g.id === process.id);
      const existing = group?.movements || [];

      let importedCount = 0;
      const reversedMovs = [...movimentacoes].reverse();

      for (const m of reversedMovs) {
        const formattedDate = formatMovementDate(m.dataHora || '');
        const desc = m.descricao || '';

        const isDuplicate = existing.some(em =>
          em.description.trim() === desc.trim() &&
          em.date === formattedDate
        );

        if (!isDuplicate) {
          addMovementToProcessGroup(
            process.id,
            processName,
            clientName,
            adverseParty,
            courtCity,
            formattedDate,
            'API_DATAJUD',
            desc
          );
          importedCount++;
        }
      }

      setSyncStatus(`Sucesso! ${importedCount} novas movimentações importadas.`);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Erro: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setSyncStatus(null), 4000);
    } finally {
      setSyncingDatajud(false);
    }
  };

  // ---- Filtro ----
  const filteredProcesses = processes.filter((process) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      process.title?.toLowerCase().includes(search) ||
      process.cnj?.toLowerCase().includes(search) ||
      process.tribunal?.toLowerCase().includes(search) ||
      process.adverseParty?.toLowerCase().includes(search);
    const matchesStatus = filterStatus ? process.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* ---- Métricas ---- */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Metric title="Ativos" value={processes.filter((p) => p.status === 'ATIVO').length} icon={<Activity className="w-6 h-6" />} color="bg-blue-500" />
        <Metric title="Suspensos" value={processes.filter((p) => p.status === 'SUSPENSO').length} icon={<AlertCircle className="w-6 h-6" />} color="bg-amber-500" />
        <Metric title="Arquivados" value={processes.filter((p) => p.status === 'ARQUIVADO').length} icon={<FolderOpen className="w-6 h-6" />} color="bg-slate-500" />
        <Metric title="Encerrados" value={processes.filter((p) => p.status === 'ENCERRADO').length} icon={<CheckCircle2 className="w-6 h-6" />} color="bg-emerald-500" />
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
                    <div className="flex justify-end gap-2 items-center">
                      {/* Botão de Movimentações (Ícone de documento ao lado do lápis - img2) */}
                      <button
                        onClick={() => openMovementsModal(process)}
                        title="Ver movimentações do processo"
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 stroke-[1.8]" />
                      </button>

                      {/* Botão Editar Processo */}
                      <button
                        onClick={() => handleEdit(process)}
                        title="Editar processo"
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 stroke-[1.8]" />
                      </button>

                      {/* Botão Excluir Processo */}
                      <button
                        onClick={() => confirmDelete(process.id)}
                        title="Excluir processo"
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.8]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- Modal: Movimentações do Processo (img3) ---- */}
      <Modal
        isOpen={isMovementsModalOpen}
        onClose={() => setIsMovementsModalOpen(false)}
        title={`Movimentações do Processo: ${selectedProcessForMovements?.title || selectedProcessForMovements?.cnj || ''}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 pt-1">
          {/* Subtítulo do Cliente e Contra */}
          <div className="text-xs font-semibold text-slate-600 border-b border-slate-100 pb-3 flex items-center gap-4">
            <span>Cliente: <strong className="text-slate-800 font-bold">{selectedProcessForMovements?.clientId ? getClientName(selectedProcessForMovements.clientId) : '-'}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Contra: <strong className="text-slate-800 font-bold">{selectedProcessForMovements?.adverseParty || '-'}</strong></span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Coluna Esquerda: HISTÓRICO DE MOVIMENTAÇÕES */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                HISTÓRICO DE MOVIMENTAÇÕES
              </h4>

              {(() => {
                const processId = selectedProcessForMovements?.id || '';
                const group = storedGroups.find(g => g.id === processId);
                const currentMovs = group?.movements || [];

                if (currentMovs.length === 0) {
                  return (
                    <div className="p-6 bg-slate-50/70 border border-slate-100 rounded-xl text-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">Nenhuma movimentação registrada para este processo.</p>
                    </div>
                  );
                }

                return (
                  <div className="pl-4 space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200/80">
                    {currentMovs.map((mov) => (
                      <div key={mov.id} className="relative pl-5">
                        <div className="absolute -left-2 top-3 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white ring-1 ring-slate-100" />
                        <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">{mov.date}</span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider
                              ${mov.origin === 'MANUAL' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                mov.origin === 'API_INFOSIMPLES' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  mov.origin === 'API_DATAJUD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                              {mov.origin}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-normal leading-relaxed">{mov.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Coluna Direita: LANÇAR MOVIMENTAÇÃO */}
            <div className="lg:col-span-5 space-y-6">
              {/* Lançar Manual */}
              <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  LANÇAR MOVIMENTAÇÃO
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      DATA / HORA
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newMovDate}
                        onChange={(e) => setNewMovDate(e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      ORIGEM
                    </label>
                    <input
                      type="text"
                      value="Manual"
                      readOnly
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none select-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      DESCRIÇÃO
                    </label>
                    <textarea
                      rows={4}
                      value={newMovDescription}
                      onChange={(e) => setNewMovDescription(e.target.value)}
                      placeholder="Descreva o andamento do processo..."
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMovement}
                    className="w-full py-3 px-4 bg-[#192847] hover:bg-[#111c34] text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lançar Andamento</span>
                  </button>
                </div>
              </div>

              {/* Sincronização via API */}
              <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  ATUALIZAÇÃO AUTOMÁTICA
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Busque movimentações em tempo real usando as APIs de consulta integradas.
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    disabled={syncingInfosimples || syncingDatajud}
                    onClick={handleSyncInfosimples}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {syncingInfosimples ? 'Buscando Infosimples...' : 'Sincronizar via Infosimples'}
                  </button>

                  <button
                    type="button"
                    disabled={syncingInfosimples || syncingDatajud}
                    onClick={handleSyncDatajud}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {syncingDatajud ? 'Buscando DataJud...' : 'Sincronizar via DataJud'}
                  </button>
                </div>

                {syncStatus && (
                  <p className="text-[10px] font-bold text-center text-slate-600 animate-pulse">
                    {syncStatus}
                  </p>
                )}

                {/* Guia de Limitações / Dicas */}
                <div className="pt-3 border-t border-slate-200/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Guia de Utilização:
                  </span>
                  <ul className="list-disc pl-3 text-[10px] text-slate-500 space-y-1.5 leading-relaxed">
                    <li>
                      <strong className="text-blue-700">Infosimples:</strong> Para processos <strong>Estaduais (TJPR, TJSP, etc.)</strong>. Traz dados completos em tempo real. Não suporta processos federais (TRF4) ou trabalhistas (TRTs).
                    </li>
                    <li>
                      <strong className="text-emerald-700">DataJud (CNJ):</strong> Para <strong>qualquer tribunal (inclui TRF4 e TRTs)</strong>. É 100% gratuito, mas pode ter delay de sincronização e oculta nomes/CPFs por privacidade.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ---- Modal Criar/Editar Processo ---- */}
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

          {/* Cliente Vinculado + Contra (Parte Contrária) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente Vinculado</label>
              <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="">Nenhum cliente vinculado</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.cpfCnpj ? ` — ${client.cpfCnpj}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contra (Parte Contrária)</label>
              <input
                type="text"
                placeholder="Ex: Mercado Livre"
                value={formData.adverseParty}
                onChange={(e) => setFormData({ ...formData, adverseParty: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea placeholder="Detalhes da causa..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-24 resize-y" />
          </div>

          <Actions onCancel={() => { setIsModalOpen(false); setIsUserDropdownOpen(false); }} onConfirm={handleSave} label="Salvar Processo" />
        </div>
      </Modal>

      {/* ---- Modal Excluir Processo ---- */}
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

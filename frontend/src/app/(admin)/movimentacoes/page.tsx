'use client';

import { useState, useEffect } from 'react';
import {
  Scale,
  Search,
  AlertCircle,
  Server,
  User,
  Check,
  CheckSquare,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import {
  TaskPriority,
  TaskStatus,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  AgendaCategory,
  Process,
  Client,
} from '@/types';
import {
  ProcessGroup,
  MovementItem,
  MovementOrigin,
  MovementStatus,
  getStoredProcessGroups,
  saveStoredProcessGroups,
  addMovementToProcessGroup,
  MOVEMENT_UPDATE_EVENT,
} from '@/services/movementStorage';

const categoryColors: Record<string, string> = {
  'Reunião': 'bg-blue-600',
  'Audiência': 'bg-purple-600',
  'Prazo': 'bg-red-600',
  'Tarefa': 'bg-green-600',
  'Outros': 'bg-slate-400',
};

const labelToCategoryMap: Record<string, AgendaCategory> = {
  'Reunião': 'MEETING',
  'Audiência': 'HEARING',
  'Prazo': 'DEADLINE',
  'Tarefa': 'TASK',
  'Outros': 'OTHER',
};

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

const monthNames = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

export default function Movimentacoes() {
  const [activeTab, setActiveTab] = useState<'VALIDAR' | 'HISTORICO'>('VALIDAR');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrigin, setFilterOrigin] = useState<string>('');

  const [processes, setProcesses] = useState<ProcessGroup[]>([]);
  const [selectedMovements, setSelectedMovements] = useState<Record<string, string[]>>({});
  const [collapsedProcesses, setCollapsedProcesses] = useState<Record<string, boolean>>({});

  // Carregar e sincronizar movimentações salvas
  useEffect(() => {
    const loadMovements = async () => {
      const stored = getStoredProcessGroups();
      try {
        const [procRes, clientRes] = await Promise.all([
          api.get('/processes'),
          api.get('/clients'),
        ]);
        const backendProcesses: Process[] = procRes.data || [];
        const clients: Client[] = clientRes.data || [];

        const enriched = stored.map((group) => {
          const bp = backendProcesses.find((p) => p.id === group.id);
          if (!bp) return group;
          const clientObj = clients.find((c) => c.id === bp.clientId);
          return {
            ...group,
            processName: bp.title || bp.cnj || group.processName,
            clientName: clientObj?.name || (bp.clientId ? group.clientName : '-'),
            adverseParty: bp.adverseParty || group.adverseParty || '-',
            courtCity: `${bp.tribunal || '-'} - ${bp.vara || '-'}`,
          };
        });

        setProcesses(enriched);
      } catch (err) {
        setProcesses(stored);
      }
    };

    void loadMovements();

    const handleUpdate = () => { void loadMovements(); };
    window.addEventListener(MOVEMENT_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(MOVEMENT_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Modal para Nova Movimentação Manual
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  const [newOrigin, setNewOrigin] = useState<MovementOrigin>('MANUAL');
  const [newDescription, setNewDescription] = useState('');

  // Modal de Confirmação de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState<{ processId: string; movementId: string } | null>(null);

  // Modal de Validação (Validar Andamento Processual)
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [validateTarget, setValidateTarget] = useState<{ proc: ProcessGroup; mov: MovementItem } | null>(null);

  // Modal de Agenda (Novo Evento - img3)
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaDate, setAgendaDate] = useState('2026-08-25');
  const [agendaStartTime, setAgendaStartTime] = useState('10:00');
  const [agendaEndTime, setAgendaEndTime] = useState('11:00');
  const [agendaLocation, setAgendaLocation] = useState('');
  const [agendaCategory, setAgendaCategory] = useState('Reunião');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [modalMonthDate, setModalMonthDate] = useState(new Date(2026, 7, 1)); // Agosto 2026
  const [agendaMovementInfo, setAgendaMovementInfo] = useState<{ processName?: string } | null>(null);
  const [agendaValidateTarget, setAgendaValidateTarget] = useState<{ processId: string; movementId: string } | null>(null);

  // Modal de Tarefa (Nova Tarefa - img4)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('PENDING');
  const [taskValidateTarget, setTaskValidateTarget] = useState<{ processId: string; movementId: string } | null>(null);

  // Feedback Toast Notification
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Handler: Abrir Modal de Validação
  const openValidateModal = (proc: ProcessGroup, mov: MovementItem) => {
    setValidateTarget({ proc, mov });
    setIsValidateModalOpen(true);
  };

  // Handler: Validar movimentação pura
  const handleValidate = (processId: string, movementId: string) => {
    const updated = processes.map(p => {
      if (p.id !== processId) return p;
      return {
        ...p,
        movements: p.movements.map(m =>
          m.id === movementId ? { ...m, status: 'VALIDATED' as MovementStatus } : m
        ),
      };
    });

    setProcesses(updated);
    saveStoredProcessGroups(updated);
  };

  // Opção 1: Apenas Validar
  const handleJustValidate = () => {
    if (validateTarget) {
      handleValidate(validateTarget.proc.id, validateTarget.mov.id);
      showFeedback('Movimentação validada e enviada para o Histórico!');
    }
    setIsValidateModalOpen(false);
    setValidateTarget(null);
  };

  // Opção 2: Validar e Criar Tarefa
  const handleValidateAndTask = () => {
    if (validateTarget) {
      const { proc, mov } = validateTarget;
      setIsValidateModalOpen(false);
      openTaskModal(proc, mov, true);
    }
    setValidateTarget(null);
  };

  // Opção 3: Validar e Agendar
  const handleValidateAndAgenda = () => {
    if (validateTarget) {
      const { proc, mov } = validateTarget;
      setIsValidateModalOpen(false);
      openAgendaModal(proc, mov, true);
    }
    setValidateTarget(null);
  };

  // Handler: Solicitar Exclusão
  const confirmDelete = (processId: string, movementId: string) => {
    setTargetToDelete({ processId, movementId });
    setIsDeleteModalOpen(true);
  };

  // Handler: Confirmar Exclusão
  const handleExecuteDelete = () => {
    if (targetToDelete) {
      const updated = processes.map(p => {
        if (p.id !== targetToDelete.processId) return p;
        return {
          ...p,
          movements: p.movements.filter(m => m.id !== targetToDelete.movementId),
        };
      });
      setProcesses(updated);
      saveStoredProcessGroups(updated);

      // Limpar da seleção se for a movimentação excluída
      setSelectedMovements(prev => {
        const current = prev[targetToDelete.processId] || [];
        return {
          ...prev,
          [targetToDelete.processId]: current.filter(id => id !== targetToDelete.movementId)
        };
      });

      showFeedback('Movimentação removida com sucesso!');
    }
    setIsDeleteModalOpen(false);
    setTargetToDelete(null);
  };

  // Handler: Abrir Modal de Agenda (Novo Evento - img3)
  const openAgendaModal = (proc: ProcessGroup, mov: MovementItem, validateOnSave = false) => {
    setAgendaTitle(`Andamento: ${mov.description}`);
    setAgendaLocation('');
    setAgendaCategory('Reunião');
    setAgendaStartTime('10:00');
    setAgendaEndTime('11:00');
    setAgendaDate('2026-08-25');
    setModalMonthDate(new Date(2026, 7, 1));
    setAgendaMovementInfo({ processName: proc.processName });
    if (validateOnSave) {
      setAgendaValidateTarget({ processId: proc.id, movementId: mov.id });
    } else {
      setAgendaValidateTarget(null);
    }
    setIsAgendaModalOpen(true);
  };

  // Handler: Salvar Evento na Agenda
  const handleSaveAgenda = async () => {
    if (!agendaTitle.trim()) {
      showFeedback('O título do compromisso é obrigatório.');
      return;
    }

    const payload = {
      title: agendaTitle.trim(),
      date: agendaDate,
      startTime: agendaStartTime,
      endTime: agendaEndTime,
      location: agendaLocation.trim() || undefined,
      category: labelToCategoryMap[agendaCategory] || 'OTHER',
      description: `Gerado a partir da movimentação do processo: ${agendaMovementInfo?.processName || ''}`,
    };

    try {
      await api.post('/agenda', payload);
    } catch (err) {
      console.warn('Salvando evento no fluxo local:', err);
    }

    if (agendaValidateTarget) {
      handleValidate(agendaValidateTarget.processId, agendaValidateTarget.movementId);
      showFeedback('Evento agendado e movimentação validada com sucesso!');
      setAgendaValidateTarget(null);
    } else {
      showFeedback('Evento agendado com sucesso na Agenda!');
    }

    setIsAgendaModalOpen(false);
  };

  // Handler: Abrir Modal de Tarefa (Nova Tarefa - img4)
  const openTaskModal = (proc: ProcessGroup, mov: MovementItem, validateOnSave = false) => {
    setTaskTitle(`Tarefa: ${mov.description}`);
    setTaskDescription(`Processo: ${proc.processName} | Cliente: ${proc.clientName}\nAndamento: ${mov.description}`);
    setTaskPriority('MEDIUM');
    setTaskStatus('PENDING');
    if (validateOnSave) {
      setTaskValidateTarget({ processId: proc.id, movementId: mov.id });
    } else {
      setTaskValidateTarget(null);
    }
    setIsTaskModalOpen(true);
  };

  // Handler: Salvar Nova Tarefa
  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      showFeedback('O título da tarefa é obrigatório.');
      return;
    }

    const payload = {
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      priority: taskPriority,
      status: taskStatus,
    };

    try {
      await api.post('/tasks', payload);
    } catch (err) {
      console.warn('Salvando tarefa no fluxo local:', err);
    }

    if (taskValidateTarget) {
      handleValidate(taskValidateTarget.processId, taskValidateTarget.movementId);
      showFeedback('Tarefa criada e movimentação validada com sucesso!');
      setTaskValidateTarget(null);
    } else {
      showFeedback('Tarefa criada com sucesso!');
    }

    setIsTaskModalOpen(false);
  };

  // Handler: Salvar Nova Movimentação Manual via modal próprio
  const handleSaveNewMovement = () => {
    if (!newDescription.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const targetProc = processes.find(p => p.id === selectedProcessId);

    addMovementToProcessGroup(
      selectedProcessId,
      targetProc?.processName || 'Sem Título',
      targetProc?.clientName || '-',
      targetProc?.adverseParty || '-',
      targetProc?.courtCity || '-',
      formattedDate,
      newOrigin,
      newDescription.trim()
    );

    setNewDescription('');
    setIsNewModalOpen(false);
    showFeedback('Nova movimentação cadastrada com sucesso!');
  };

  // Handler: Alternar colapso/visibilidade das movimentações de um processo
  const toggleProcessCollapse = (processId: string) => {
    setCollapsedProcesses(prev => ({
      ...prev,
      [processId]: !prev[processId]
    }));
  };

  // Handler: Alternar seleção de uma única movimentação de um processo
  const toggleMovementSelection = (procId: string, movId: string) => {
    setSelectedMovements(prev => {
      const current = prev[procId] || [];
      const isSelected = current.includes(movId);
      const updated = isSelected
        ? current.filter(id => id !== movId)
        : [...current, movId];
      return {
        ...prev,
        [procId]: updated
      };
    });
  };

  // Handler: Alternar "Selecionar Todas" as movimentações de um processo
  const toggleSelectAllForProcess = (procId: string, movements: MovementItem[]) => {
    const allMovIds = movements.map(m => m.id);
    setSelectedMovements(prev => {
      const current = prev[procId] || [];
      const allSelected = allMovIds.every(id => current.includes(id));
      const updated = allSelected ? [] : allMovIds;
      return {
        ...prev,
        [procId]: updated
      };
    });
  };

  // Handler: Validar movimentações selecionadas de um processo específico
  const handleValidateSelected = (procId: string) => {
    const selectedIds = selectedMovements[procId] || [];
    if (selectedIds.length === 0) return;

    const updated = processes.map(p => {
      if (p.id !== procId) return p;
      return {
        ...p,
        movements: p.movements.map(m =>
          selectedIds.includes(m.id) ? { ...m, status: 'VALIDATED' as MovementStatus } : m
        ),
      };
    });

    setProcesses(updated);
    saveStoredProcessGroups(updated);

    setSelectedMovements(prev => ({
      ...prev,
      [procId]: []
    }));

    showFeedback(`${selectedIds.length} movimentações validadas e enviadas para o Histórico!`);
  };

  // Lógica do Calendário no Modal de Agenda (img3)
  const mYear = modalMonthDate.getFullYear();
  const mMonth = modalMonthDate.getMonth();
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const mFirstDay = new Date(mYear, mMonth, 1).getDay();
  const mDaysInMonth = getDaysInMonth(mYear, mMonth);
  const mPrevMonthDays = getDaysInMonth(mYear, mMonth - 1);

  const modalCalendarDays = [];
  for (let i = mFirstDay - 1; i >= 0; i--) {
    modalCalendarDays.push({ day: mPrevMonthDays - i, isCurrent: false, dateStr: null });
  }
  for (let i = 1; i <= mDaysInMonth; i++) {
    const dStr = `${mYear}-${(mMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    modalCalendarDays.push({ day: i, isCurrent: true, dateStr: dStr });
  }
  const mTotalCells = Math.ceil(modalCalendarDays.length / 7) * 7;
  for (let i = 1; i <= mTotalCells - modalCalendarDays.length; i++) {
    modalCalendarDays.push({ day: i, isCurrent: false, dateStr: null });
  }

  const prevModalMonth = () => setModalMonthDate(new Date(mYear, mMonth - 1, 1));
  const nextModalMonth = () => setModalMonthDate(new Date(mYear, mMonth + 1, 1));

  // Cálculo de métricas
  const allMovements = processes.flatMap(p => p.movements);
  const pendingMovements = allMovements.filter(m => m.status === 'PENDING');
  const validatedMovements = allMovements.filter(m => m.status === 'VALIDATED');

  const currentMovementsList = activeTab === 'VALIDAR' ? pendingMovements : validatedMovements;

  const countPending = pendingMovements.length;
  const countApi = currentMovementsList.filter(m => m.origin === 'API_TRIBUNAL').length;
  const countManual = currentMovementsList.filter(m => m.origin === 'MANUAL').length;

  // Filtragem dos processos agrupados
  const filteredProcesses = processes.map(proc => {
    const matchingMovements = proc.movements.filter(mov => {
      const matchesTab = activeTab === 'VALIDAR' ? mov.status === 'PENDING' : mov.status === 'VALIDATED';
      if (!matchesTab) return false;

      if (filterOrigin && mov.origin !== filterOrigin) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesProc = proc.processName.toLowerCase().includes(query);
        const matchesClient = proc.clientName.toLowerCase().includes(query);
        const matchesDesc = mov.description.toLowerCase().includes(query);
        return matchesProc || matchesClient || matchesDesc;
      }

      return true;
    });

    return {
      ...proc,
      movements: matchingMovements,
    };
  }).filter(proc => proc.movements.length > 0);

  const visibleMovementsCount = filteredProcesses.reduce((acc, p) => acc + p.movements.length, 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto relative">
      {/* Toast Feedback Notification Banner */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Cards de Métricas (Top Bar) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Pendentes */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">PENDENTES DE VALIDAÇÃO</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">
                {countPending < 10 ? `0${countPending}` : countPending}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: API Tribunal */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">ORIGEM: API TRIBUNAL</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">
                {countApi < 10 ? `0${countApi}` : countApi}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Server className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Manual */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-700"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">ORIGEM: MANUAL</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-headline">
                {countManual < 10 ? `0${countManual}` : countManual}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <User className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Busca e Filtro de Origem */}
      <section className="bg-slate-100/70 p-4 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 outline-none text-slate-800"
              placeholder="Buscar por número do processo, cliente ou descrição..."
              type="text"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={filterOrigin}
              onChange={e => setFilterOrigin(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200/60 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 outline-none cursor-pointer"
            >
              <option value="">Todas as Origens</option>
              <option value="MANUAL">Manual</option>
              <option value="API_TRIBUNAL">API Tribunal</option>
            </select>
          </div>
        </div>
      </section>

      {/* Abas: VALIDAR MOVIMENTAÇÃO | HISTÓRICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4 font-sans">
        <div className="flex items-center gap-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('VALIDAR')}
              className={`py-2 text-xs font-bold uppercase tracking-wider transition-all relative ${
                activeTab === 'VALIDAR'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              VALIDAR MOVIMENTAÇÃO
            </button>
            <button
              onClick={() => setActiveTab('HISTORICO')}
              className={`py-2 text-xs font-bold uppercase tracking-wider transition-all relative ${
                activeTab === 'HISTORICO'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              HISTÓRICO
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Processos Agrupados com Timeline */}
      <section className="flex flex-col gap-6">
        {filteredProcesses.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-xl border border-slate-100 text-center text-slate-500 space-y-3">
            <Scale className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700 text-base">Nenhuma movimentação encontrada.</p>
            <p className="text-xs text-slate-400">
              {activeTab === 'VALIDAR'
                ? 'Não há pendências de validação no momento.'
                : 'Não há movimentações validadas no histórico.'}
            </p>
          </div>
        ) : (
          filteredProcesses.map(proc => {
            const isCollapsed = !!collapsedProcesses[proc.id];
            return (
              <div key={proc.id} className="bg-surface-container-lowest rounded-xl border border-slate-200/80 shadow-xs p-6 flex flex-col gap-6">
                {/* Header do Processo */}
                <div 
                  onClick={() => toggleProcessCollapse(proc.id)}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PROCESSO</p>
                      <h4 className="text-base font-bold text-slate-900">{proc.processName}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto">
                    <div className="grid grid-cols-3 gap-6 text-left">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CLIENTE</p>
                        <p className="text-sm font-semibold text-slate-800">{proc.clientName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CONTRA</p>
                        <p className="text-sm font-semibold text-slate-800">{proc.adverseParty}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">VARA / CIDADE</p>
                        <p className="text-sm font-semibold text-slate-800">{proc.courtCity}</p>
                      </div>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
                    </div>
                  </div>
                </div>

                {/* Barra de Validação de Movimentações Selecionadas */}
                {!isCollapsed && activeTab === 'VALIDAR' ? (
                  (selectedMovements[proc.id] || []).length > 0 ? (
                    <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100/60 rounded-xl px-4 py-3 text-xs text-slate-700 font-sans animate-in fade-in duration-200">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          {(selectedMovements[proc.id] || []).length} movimentação(ões) selecionada(s) para validação.
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectAllForProcess(proc.id, proc.movements);
                          }}
                          className="text-slate-400 hover:text-slate-600 hover:underline font-bold cursor-pointer text-[10px] uppercase tracking-wider pl-3 border-l border-slate-200"
                        >
                          {(selectedMovements[proc.id] || []).length === proc.movements.length ? 'Desmarcar todas' : 'Selecionar todas'}
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValidateSelected(proc.id);
                        }}
                        className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Validar Selecionadas</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100/80 rounded-xl px-4 py-2.5 text-[11px] text-slate-500 font-sans">
                      <span>Nenhuma movimentação selecionada neste processo.</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectAllForProcess(proc.id, proc.movements);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-bold cursor-pointer uppercase tracking-wider text-[10px]"
                      >
                        Selecionar todas
                      </button>
                    </div>
                  )
                ) : null}

                {/* Linha do Tempo de Movimentações */}
                {!isCollapsed && (
                  <div className="pl-6 flex flex-col gap-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {proc.movements.map(mov => (
                      <div key={mov.id} className="relative pl-6">
                        {/* Node Dot ou Checkbox Circular */}
                        {activeTab === 'VALIDAR' ? (
                      <button
                        onClick={() => toggleMovementSelection(proc.id, mov.id)}
                        className={`absolute -left-[15px] top-[13px] w-5 h-5 rounded-full border transition-all flex items-center justify-center cursor-pointer z-10 ${
                          (selectedMovements[proc.id] || []).includes(mov.id)
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm scale-110'
                            : 'bg-white border-slate-300 hover:border-emerald-500 hover:scale-110'
                        }`}
                      >
                        {(selectedMovements[proc.id] || []).includes(mov.id) ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : null}
                      </button>
                    ) : (
                      <div className="absolute -left-3 top-4 w-3.5 h-3.5 rounded-full bg-slate-300 border-2 border-white ring-2 ring-slate-100" />
                    )}

                    {/* Card do Andamento */}
                    <div className="bg-white border border-slate-200/70 rounded-xl p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
                      {/* Sub-header do Card */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500">{mov.date}</span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                              mov.origin === 'API_TRIBUNAL'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {mov.origin === 'API_TRIBUNAL' ? 'API TRIBUNAL' : 'MANUAL'}
                          </span>
                        </div>

                        {/* Botões de Ação Rápida */}
                        <div className="flex items-center gap-2">
                          {/* 1. Botão Validar (Check verde) - Abre o Modal de Validação */}
                          {activeTab === 'VALIDAR' && (
                            <button
                              onClick={() => openValidateModal(proc, mov)}
                              title="Validar movimentação"
                              className="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 border border-emerald-300/80 rounded-lg transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          )}

                          {/* 2. Botão Tarefa (Checkbox quadrado azul) */}
                          <button
                            onClick={() => openTaskModal(proc, mov)}
                            title="Criar tarefa a partir desta movimentação"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-300/80 rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckSquare className="w-4 h-4 stroke-[2.2]" />
                          </button>

                          {/* 3. Botão Agenda (Calendário roxo) */}
                          <button
                            onClick={() => openAgendaModal(proc, mov)}
                            title="Agendar evento na agenda"
                            className="p-1.5 text-purple-600 hover:bg-purple-50 border border-purple-300/80 rounded-lg transition-colors cursor-pointer"
                          >
                            <Calendar className="w-4 h-4 stroke-[2.2]" />
                          </button>

                          {/* 4. Botão Excluir (Lixeira vermelha) */}
                          <button
                            onClick={() => confirmDelete(proc.id, mov.id)}
                            title="Excluir movimentação"
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-red-300/80 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>
                      </div>

                      {/* Descrição da Movimentação */}
                      <p className="text-sm text-slate-700 leading-relaxed font-normal">{mov.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })
        )}
      </section>

      {/* Modal: Validar Andamento Processual */}
      <Modal
        isOpen={isValidateModalOpen}
        onClose={() => {
          setIsValidateModalOpen(false);
          setValidateTarget(null);
        }}
        title="Validar Andamento Processual"
      >
        <div className="space-y-6 pt-1">
          {/* Card Resumo do Andamento */}
          {validateTarget && (
            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Scale className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Processo: {validateTarget.proc.processName}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Data: {validateTarget.mov.date}</p>
              <div className="bg-white border border-slate-200/60 rounded-lg p-3 text-sm italic text-slate-700 font-medium mt-2">
                &quot;{validateTarget.mov.description}&quot;
              </div>
            </div>
          )}

          {/* Opções de Ação Principais */}
          <div className="space-y-3">
            {/* Opção 1: Apenas Validar (Verde) */}
            <button
              type="button"
              onClick={handleJustValidate}
              className="w-full py-3.5 px-5 bg-[#00a86b] hover:bg-[#00925d] text-white font-bold rounded-xl flex items-center justify-center gap-2.5 text-sm shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Apenas Validar</span>
            </button>

            {/* Opção 2: Validar e Criar Tarefa (Azul Escuro/Navy) */}
            <button
              type="button"
              onClick={handleValidateAndTask}
              className="w-full py-3.5 px-5 bg-[#1e294b] hover:bg-[#131b33] text-white font-bold rounded-xl flex items-center justify-center gap-2.5 text-sm shadow-xs transition-all cursor-pointer"
            >
              <CheckSquare className="w-5 h-5 stroke-[2]" />
              <span>Validar e Criar Tarefa</span>
            </button>

            {/* Opção 3: Validar e Agendar (Roxo) */}
            <button
              type="button"
              onClick={handleValidateAndAgenda}
              className="w-full py-3.5 px-5 bg-[#5b46f6] hover:bg-[#4a34eb] text-white font-bold rounded-xl flex items-center justify-center gap-2.5 text-sm shadow-xs transition-all cursor-pointer"
            >
              <Calendar className="w-5 h-5 stroke-[2]" />
              <span>Validar e Agendar</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Novo Evento (Agenda - img3) */}
      <Modal
        isOpen={isAgendaModalOpen}
        onClose={() => {
          setIsAgendaModalOpen(false);
          setAgendaValidateTarget(null);
        }}
        title="Novo Evento"
      >
        <div className="space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input
              type="text"
              value={agendaTitle}
              onChange={e => setAgendaTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Digite o título do compromisso..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Lado Esquerdo: Calendário Inline */}
            <div className="md:col-span-5 space-y-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 shadow-2xs">
                {/* Header de Mês / Ano */}
                <div className="flex justify-between items-center mb-3 px-1">
                  <button
                    type="button"
                    onClick={prevModalMonth}
                    className="p-1 hover:bg-slate-200/70 rounded-lg text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-extrabold text-slate-800 tracking-wider">
                    {monthNames[mMonth]} {mYear}
                  </span>
                  <button
                    type="button"
                    onClick={nextModalMonth}
                    className="p-1 hover:bg-slate-200/70 rounded-lg text-slate-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Grid de Dias */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
                    <span key={`h-${d}-${idx}`} className="font-bold text-slate-400 mb-1 text-[11px]">
                      {d}
                    </span>
                  ))}
                  {modalCalendarDays.map((c, i) => {
                    const isSelected = c.isCurrent && agendaDate === c.dateStr;
                    return (
                      <button
                        type="button"
                        key={`md-${i}`}
                        onClick={() => c.isCurrent && c.dateStr && setAgendaDate(c.dateStr)}
                        disabled={!c.isCurrent}
                        className={`w-7 h-7 flex items-center justify-center rounded-full mx-auto text-xs transition-all ${
                          isSelected
                            ? 'bg-slate-800 text-white font-bold shadow-xs'
                            : c.isCurrent
                            ? 'text-slate-700 hover:bg-slate-200/80 bg-white font-medium'
                            : 'text-transparent cursor-default'
                        }`}
                      >
                        {c.isCurrent ? c.day : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Lado Direito: Horário, Localização e Categoria */}
            <div className="md:col-span-7 space-y-4">
              {/* Horário (Início - Fim) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário (Início - Fim)</label>
                <div className="flex items-center gap-2">
                  <select
                    value={agendaStartTime}
                    onChange={e => setAgendaStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {timeOptions.map(t => (
                      <option key={`start-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400 text-xs shrink-0 font-medium">até</span>
                  <select
                    value={agendaEndTime}
                    onChange={e => setAgendaEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {timeOptions.map(t => (
                      <option key={`end-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Localização / Link */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Localização/Link</label>
                <input
                  type="text"
                  value={agendaLocation}
                  onChange={e => setAgendaLocation(e.target.value)}
                  placeholder="Endereço ou Link da Reunião"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Categoria */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white flex items-center justify-between text-slate-700 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${categoryColors[agendaCategory] || 'bg-slate-400'}`}></span>
                    <span>{agendaCategory}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isCategoryOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1">
                    {Object.entries(categoryColors).map(([cat, colorClass]) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setAgendaCategory(cat);
                          setIsCategoryOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-sm transition-colors"
                      >
                        <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Ações */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsAgendaModalOpen(false);
                setAgendaValidateTarget(null);
              }}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAgenda}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Nova Tarefa (img4) */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskValidateTarget(null);
        }}
        title="Nova Tarefa"
      >
        <div className="space-y-4">
          {/* Título da Tarefa */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título da Tarefa</label>
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Digite o título da tarefa..."
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea
              rows={4}
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Digite a descrição da tarefa..."
            />
          </div>

          {/* Prioridade & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-2.5 border border-amber-200/80 bg-amber-50/70 text-amber-900 font-bold rounded-lg text-sm outline-none cursor-pointer focus:ring-2 focus:ring-amber-500/20"
              >
                {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-white text-slate-800 font-normal">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={taskStatus}
                onChange={e => setTaskStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-2.5 border border-amber-200/80 bg-amber-50/70 text-amber-900 font-bold rounded-lg text-sm outline-none cursor-pointer focus:ring-2 focus:ring-amber-500/20"
              >
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-white text-slate-800 font-normal">
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Ações */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsTaskModalOpen(false);
                setTaskValidateTarget(null);
              }}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveTask}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Excluir Movimentação */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Movimentação"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Deseja realmente remover esta movimentação? Esta ação não poderá ser desfeita.
          </p>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleExecuteDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Nova Movimentação Manual */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nova Movimentação Manual"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Processo</label>
            <select
              value={selectedProcessId}
              onChange={e => setSelectedProcessId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-slate-800 text-sm"
            >
              {processes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.processName} - {p.clientName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Origem</label>
            <select
              value={newOrigin}
              onChange={e => setNewOrigin(e.target.value as MovementOrigin)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-slate-800 text-sm"
            >
              <option value="MANUAL">Manual</option>
              <option value="API_TRIBUNAL">API Tribunal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Andamento</label>
            <textarea
              rows={4}
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Digite o texto da movimentação processual..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-slate-800 text-sm placeholder:text-slate-400"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveNewMovement}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              Salvar Movimentação
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

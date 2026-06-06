'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, CheckSquare, Clock, Edit2, Search, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import { Task, TaskPriority, TaskStatus, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, User } from '@/types';

interface TaskForm {
  title: string;
  description: string;
  assignedToId: string;
  priority: TaskPriority;
  status: TaskStatus;
}

const emptyForm: TaskForm = {
  title: '',
  description: '',
  assignedToId: '',
  priority: 'MEDIUM',
  status: 'PENDING',
};

export default function Tarefas() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState<TaskForm>(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, usersResponse] = await Promise.all([
        api.get('/tasks'),
        api.get('/users'),
      ]);
      setTasks(tasksResponse.data);
      setUsers(usersResponse.data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
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

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingTask(null);
      setFormData(emptyForm);
      setIsModalOpen(true);
    };

    window.addEventListener('open-new-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-modal', handleOpenModal);
  }, []);

  const getUserName = (id?: string) => users.find((user) => user.id === id)?.name || '-';

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedToId: task.assignedToId || '',
      priority: task.priority,
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        assignedToId: formData.assignedToId || undefined,
        description: formData.description || undefined,
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar tarefa:', err);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (deletingId) await api.delete(`/tasks/${deletingId}`);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(search) ||
      task.id.toLowerCase().includes(search) ||
      getUserName(task.assignedToId).toLowerCase().includes(search);
    const matchesPriority = filterPriority ? task.priority === filterPriority : true;
    const matchesStatus = filterStatus ? task.status === filterStatus : true;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Metric title="A Fazer / Pendentes" value={tasks.filter((task) => task.status === 'PENDING').length} icon={<Clock className="w-6 h-6" />} color="bg-amber-500" />
        <Metric title="Em Andamento" value={tasks.filter((task) => task.status === 'IN_PROGRESS').length} icon={<CheckSquare className="w-6 h-6" />} color="bg-primary" />
        <Metric title="Concluídas" value={tasks.filter((task) => task.status === 'COMPLETED').length} icon={<CheckCircle className="w-6 h-6" />} color="bg-green-500" />
      </section>

      <section className="bg-surface-container-low p-6 rounded-xl border border-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50 outline-none" placeholder="Buscar por tarefa ou responsável..." type="text" />
          </div>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all text-on-surface-variant outline-none">
            <option value="">Todas as Prioridades</option>
            {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all text-on-surface-variant outline-none">
            <option value="">Todos os Status</option>
            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tarefa</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Responsável</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Prioridade</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Carregando tarefas...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhuma tarefa encontrada.</td></tr>
              ) : filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 block">{task.title}</span>
                    <span className="text-xs text-slate-500">{task.description || task.id}</span>
                  </td>
                  <td className="px-6 py-4"><span className="text-sm text-slate-700">{getUserName(task.assignedToId)}</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${task.priority === 'HIGH' ? 'bg-red-50 text-red-700' : task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {TASK_PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${task.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(task)} className="p-2 text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(task.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título da Tarefa</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Responsável</label>
              <select value={formData.assignedToId} onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="">Sem responsável</option>
                {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
              {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <Actions onCancel={() => setIsModalOpen(false)} onConfirm={handleSave} label="Salvar" />
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Tarefa">
        <div className="space-y-4">
          <p className="text-slate-600">Deseja mesmo apagar esta tarefa?</p>
          <Actions onCancel={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} label="Excluir" destructive />
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

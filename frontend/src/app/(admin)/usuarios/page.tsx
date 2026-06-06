'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Edit2, Search, Shield, Trash2, UserCheck, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import { User } from '@/types';

interface AccessForm {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  phone: string;
  cpf: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  companyId: string;
}

const emptyForm: AccessForm = {
  name: '',
  email: '',
  password: '',
  isActive: true,
  phone: '',
  cpf: '',
  address: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  companyId: '',
};

const formatDate = (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : '-';

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState<AccessForm>(emptyForm);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchUsers();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingUser(null);
      setFormData({ ...emptyForm, companyId: users[0]?.companyId || '' });
      setIsModalOpen(true);
    };

    window.addEventListener('open-new-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-modal', handleOpenModal);
  }, [users]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      isActive: user.isActive,
      phone: user.phone || '',
      cpf: user.cpf || '',
      address: user.address || '',
      addressNumber: user.addressNumber || '',
      addressComplement: user.addressComplement || '',
      neighborhood: user.neighborhood || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      companyId: user.companyId,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        role: 'STAFF',
        password: formData.password || undefined,
      };

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post('/users', payload);
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (deletingId) await api.delete(`/users/${deletingId}`);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search);
    const matchesStatus = filterStatus ? (filterStatus === 'Ativo' ? user.isActive : !user.isActive) : true;
    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const staffUsers = users.filter((user) => user.role === 'STAFF').length;
  const activeUsers = users.filter((user) => user.isActive).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Metric label="Total de Usuários" value={totalUsers} icon={<Users className="w-6 h-6" />} color="bg-primary" />
        <Metric label="Staff" value={staffUsers} icon={<Shield className="w-6 h-6" />} color="bg-secondary" />
        <Metric label="Ativos" value={activeUsers} icon={<UserCheck className="w-6 h-6" />} color="bg-green-500" />
      </section>

      <section className="bg-surface-container-low p-6 rounded-xl border border-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50 outline-none text-slate-800" placeholder="Buscar por nome, email ou cargo..." type="text" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 outline-none">
            <option value="">Todos os Status</option>
            <option value="Ativo">Ativos</option>
            <option value="Inativo">Inativos</option>
          </select>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cargo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Nível de Acesso</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Carregando usuários...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
                      {user.name.split(' ').map((name) => name[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{user.name}</span>
                      <span className="text-[10px] text-on-surface-variant">{user.email} • {formatDate(user.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-sm text-slate-700">{user.role}</span></td>
                  <td className="px-6 py-4"><span className="text-sm text-slate-700">Permissões não configuradas</span></td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(user)} className="p-2 text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(user.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}>
        <div className="space-y-4">
          <Input label="Nome" value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} />
          <Input label="Email" value={formData.email} onChange={(value) => setFormData({ ...formData, email: value })} type="email" />
          <div className="grid grid-cols-2 gap-4">
            <Input label={editingUser ? 'Nova senha (opcional)' : 'Senha'} value={formData.password} onChange={(value) => setFormData({ ...formData, password: value })} type="password" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={formData.isActive ? 'Ativo' : 'Inativo'} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'Ativo' })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefone" value={formData.phone} onChange={(value) => setFormData({ ...formData, phone: value })} />
            <Input label="CPF" value={formData.cpf} onChange={(value) => setFormData({ ...formData, cpf: value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><Input label="Endereço" value={formData.address} onChange={(value) => setFormData({ ...formData, address: value })} /></div>
            <Input label="Número" value={formData.addressNumber} onChange={(value) => setFormData({ ...formData, addressNumber: value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Complemento" value={formData.addressComplement} onChange={(value) => setFormData({ ...formData, addressComplement: value })} />
            <Input label="Bairro" value={formData.neighborhood} onChange={(value) => setFormData({ ...formData, neighborhood: value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Cidade" value={formData.city} onChange={(value) => setFormData({ ...formData, city: value })} />
            <Input label="Estado" value={formData.state} onChange={(value) => setFormData({ ...formData, state: value })} />
            <Input label="CEP" value={formData.zipCode} onChange={(value) => setFormData({ ...formData, zipCode: value })} />
          </div>
          <Input label="ID da Empresa" value={formData.companyId} onChange={(value) => setFormData({ ...formData, companyId: value })} />
          <Actions onCancel={() => setIsModalOpen(false)} onConfirm={handleSave} label="Salvar" />
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Usuário">
        <div className="space-y-4">
          <p className="text-slate-600">Tem certeza que deseja remover o acesso deste usuário? Esta ação não pode ser desfeita.</p>
          <Actions onCancel={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} label="Excluir" destructive />
        </div>
      </Modal>
    </div>
  );
}

function Metric({ label, value, icon, color }: { label: string; value: number; icon: ReactNode; color: string }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{label}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 font-headline">{value.toString().padStart(2, '0')}</h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-primary">{icon}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
    </div>
  );
}

function Actions({ onCancel, onConfirm, label, destructive = false }: { onCancel: () => void; onConfirm: () => void; label: string; destructive?: boolean }) {
  return (
    <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
      <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
      <button onClick={onConfirm} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${destructive ? 'bg-red-600 hover:bg-red-500' : 'bg-primary hover:bg-primary/90'}`}>{label}</button>
    </div>
  );
}

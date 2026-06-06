'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Building2, Edit2, Mail, Phone, Search, Trash2, User, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import { Client } from '@/types';

type PersonType = 'Física' | 'Jurídica';

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  personType: PersonType;
  cpfCnpj: string;
  birthDate: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

const emptyForm: ClientForm = {
  name: '',
  email: '',
  phone: '',
  personType: 'Física',
  cpfCnpj: '',
  birthDate: '',
  address: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
};

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [formData, setFormData] = useState<ClientForm>(emptyForm);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/clients');
      setClients(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchClients();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingClient(null);
      setFormData(emptyForm);
      setIsModalOpen(true);
    };

    window.addEventListener('open-new-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-modal', handleOpenModal);
  }, []);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      personType: client.personType === 'Jurídica' ? 'Jurídica' : 'Física',
      cpfCnpj: client.cpfCnpj || '',
      birthDate: client.birthDate ? client.birthDate.slice(0, 10) : '',
      address: client.address || '',
      addressNumber: client.addressNumber || '',
      addressComplement: client.addressComplement || '',
      neighborhood: client.neighborhood || '',
      city: client.city || '',
      state: client.state || '',
      zipCode: client.zipCode || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        birthDate: formData.birthDate || undefined,
        canAccess: false,
      };

      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, payload);
      } else {
        await api.post('/clients', payload);
      }

      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (deletingId) await api.delete(`/clients/${deletingId}`);
      setIsDeleteModalOpen(false);
      fetchClients();
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
    }
  };

  const filteredClients = clients.filter((client) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      client.name.toLowerCase().includes(search) ||
      (client.email || '').toLowerCase().includes(search) ||
      (client.phone || '').includes(searchQuery) ||
      (client.cpfCnpj || '').includes(searchQuery);
    const matchesTipo = filterTipo ? client.personType === filterTipo : true;
    return matchesSearch && matchesTipo;
  });

  const totalClientes = clients.length;
  const pessoasFisicas = clients.filter((client) => client.personType !== 'Jurídica').length;
  const empresasPJ = clients.filter((client) => client.personType === 'Jurídica').length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total de Clientes" value={totalClientes} icon={<Users className="w-6 h-6" />} color="bg-primary" />
        <StatCard label="Pessoas Físicas" value={pessoasFisicas} icon={<User className="w-6 h-6" />} color="bg-emerald-500" />
        <StatCard label="Empresas (PJ)" value={empresasPJ} icon={<Building2 className="w-6 h-6" />} color="bg-blue-500" />
      </section>

      <section className="bg-surface-container-low p-6 rounded-xl border border-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50 outline-none text-slate-800"
              placeholder="Buscar por nome, email, telefone ou documento..."
              type="text"
            />
          </div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 outline-none"
          >
            <option value="">Todos os Tipos</option>
            <option value="Física">Pessoa Física</option>
            <option value="Jurídica">Pessoa Jurídica</option>
          </select>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Nome / Empresa</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Documento</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Carregando clientes...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum cliente encontrado.</td></tr>
              ) : filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${client.personType === 'Jurídica' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {client.personType === 'Jurídica' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{client.name}</p>
                        <p className="text-xs text-slate-500">ID: {client.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" />{client.email || '-'}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" />{client.phone || '-'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{client.cpfCnpj || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold tracking-tight uppercase ${client.personType === 'Jurídica' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {client.personType === 'Jurídica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(client)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-slate-50 rounded-lg transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(client.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-red-50 rounded-lg transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome / Empresa</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="E-mail" value={formData.email} onChange={(value) => setFormData({ ...formData, email: value })} type="email" />
            <FormInput label="Telefone" value={formData.phone} onChange={(value) => setFormData({ ...formData, phone: value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select value={formData.personType} onChange={(e) => setFormData({ ...formData, personType: e.target.value as PersonType })} className="w-full px-4 py-2 border rounded-lg outline-none bg-white">
                <option value="Física">Pessoa Física</option>
                <option value="Jurídica">Pessoa Jurídica</option>
              </select>
            </div>
            <FormInput label="CPF/CNPJ" value={formData.cpfCnpj} onChange={(value) => setFormData({ ...formData, cpfCnpj: value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Data de nascimento" value={formData.birthDate} onChange={(value) => setFormData({ ...formData, birthDate: value })} type="date" />
            <FormInput label="CEP" value={formData.zipCode} onChange={(value) => setFormData({ ...formData, zipCode: value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><FormInput label="Endereço" value={formData.address} onChange={(value) => setFormData({ ...formData, address: value })} /></div>
            <FormInput label="Número" value={formData.addressNumber} onChange={(value) => setFormData({ ...formData, addressNumber: value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Complemento" value={formData.addressComplement} onChange={(value) => setFormData({ ...formData, addressComplement: value })} />
            <FormInput label="Bairro" value={formData.neighborhood} onChange={(value) => setFormData({ ...formData, neighborhood: value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Cidade" value={formData.city} onChange={(value) => setFormData({ ...formData, city: value })} />
            <FormInput label="Estado" value={formData.state} onChange={(value) => setFormData({ ...formData, state: value })} />
          </div>
          <ModalActions onCancel={() => setIsModalOpen(false)} onConfirm={handleSave} confirmLabel="Salvar" />
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Cliente">
        <div className="space-y-4">
          <p className="text-slate-600">Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>
          <ModalActions onCancel={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} confirmLabel="Excluir" destructive />
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: ReactNode; color: string }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{label}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 font-headline">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-primary">{icon}</div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, confirmLabel, destructive = false }: { onCancel: () => void; onConfirm: () => void; confirmLabel: string; destructive?: boolean }) {
  return (
    <div className="pt-4 flex justify-end gap-2 border-t mt-6">
      <button onClick={onCancel} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700">Cancelar</button>
      <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg ${destructive ? 'bg-red-600' : 'bg-blue-600'}`}>{confirmLabel}</button>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, ChevronLeft, ChevronRight, ChevronDown, Video, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import api from '@/services/api';
import { AgendaCategory, AgendaEvent } from '@/types';

interface Event {
  id: string;
  title: string;
  time: string;
  isoDate: string;
  type: 'Online' | 'Presencial';
  location: string;
  participants: number;
  category: string;
}

const CATEGORY_TO_LABEL: Record<AgendaCategory, string> = {
  MEETING: 'Reunião',
  HEARING: 'Audiência',
  DEADLINE: 'Prazo',
  TASK: 'Tarefa',
  OTHER: 'Outros',
};

const LABEL_TO_CATEGORY: Record<string, AgendaCategory> = {
  Reunião: 'MEETING',
  Audiência: 'HEARING',
  Prazo: 'DEADLINE',
  Tarefa: 'TASK',
  Outros: 'OTHER',
  Geral: 'OTHER',
};

const categoryColors: Record<string, string> = {
  'Reunião': 'bg-blue-600',
  'Audiência': 'bg-purple-600',
  'Prazo': 'bg-red-600',
  'Tarefa': 'bg-green-600',
  'Outros': 'bg-slate-400',
  'Geral': 'bg-slate-400'
};

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const toTime = (value: string) => value?.slice(0, 5) || '00:00';

const inferEventType = (location?: string): 'Online' | 'Presencial' => {
  const normalized = (location || '').toLowerCase();
  return normalized.includes('http') || normalized.includes('meet') || normalized.includes('zoom') ? 'Online' : 'Presencial';
};

const mapAgendaToEvent = (event: AgendaEvent): Event => ({
  id: event.id,
  title: event.title,
  time: `${toTime(event.startTime)} - ${toTime(event.endTime)}`,
  isoDate: event.date.slice(0, 10),
  type: inferEventType(event.location),
  location: event.location || '',
  participants: 1,
  category: CATEGORY_TO_LABEL[event.category] || 'Outros',
});

export default function Agenda() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'Diária' | 'Semanal'>('Semanal');
  
  // States for Date
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 4, 1)); // Starts in May 2026
  const [selectedDateIso, setSelectedDateIso] = useState('2026-05-19'); // Default "today"
  const [modalMonthDate, setModalMonthDate] = useState(new Date(2026, 4, 1)); // For the inline modal calendar
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Event>>({
    title: '', time: '10:00 - 11:00', isoDate: '', type: 'Online', location: '', participants: 1, category: 'Reunião'
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/agenda');
      setEvents(data.map(mapAgendaToEvent));
    } catch (err) {
      console.error('Erro ao buscar agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchEvents();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingEvent(null);
      setFormData({ title: '', time: '10:00 - 11:00', isoDate: selectedDateIso, type: 'Online', location: '', participants: 1, category: 'Reunião' });
      setModalMonthDate(new Date(`${selectedDateIso}T12:00:00`));
      setIsModalOpen(true);
    };
    window.addEventListener('open-new-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-modal', handleOpenModal);
  }, [selectedDateIso]);

  const handleEdit = (evt: Event) => {
    setEditingEvent(evt);
    setFormData(evt);
    setModalMonthDate(new Date(`${evt.isoDate}T12:00:00`));
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const [startTime = '10:00', endTime = '11:00'] = (formData.time || '10:00 - 11:00').split(' - ');
      const payload = {
        title: formData.title || '',
        date: formData.isoDate || selectedDateIso,
        startTime,
        endTime,
        category: LABEL_TO_CATEGORY[formData.category || 'Reunião'] || 'OTHER',
        location: formData.location || undefined,
      };

      if (editingEvent) {
        await api.put(`/agenda/${editingEvent.id}`, payload);
      } else {
        await api.post('/agenda', payload);
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (deletingId) {
        await api.delete(`/agenda/${deletingId}`);
      }
      setIsDeleteModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
    }
  };

  // Monthly Calendar Logic (Left Widget)
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);
  
  const calendarDays = [];
  for (let i = firstDay - 1; i >= 0; i--) calendarDays.push({ day: prevMonthDays - i, isCurrent: false, dateStr: null });
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrent: true, dateStr: `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}` });
  }
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  for (let i = 1; i <= totalCells - calendarDays.length; i++) calendarDays.push({ day: i, isCurrent: false, dateStr: null });

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));
  const getEventsForDate = (dateStr: string) => events.filter(e => e.isoDate === dateStr);
  const formatDateLabel = (isoDate: string) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  const changeDay = (offset: number) => {
    const d = new Date(selectedDateIso + 'T12:00:00Z');
    d.setDate(d.getDate() + offset);
    setSelectedDateIso(d.toISOString().split('T')[0]);
  };

  const dailyEvents = events.filter(e => e.isoDate === selectedDateIso);

  // Inline Modal Calendar Logic
  const mYear = modalMonthDate.getFullYear();
  const mMonth = modalMonthDate.getMonth();
  const mFirstDay = new Date(mYear, mMonth, 1).getDay();
  const mDaysInMonth = getDaysInMonth(mYear, mMonth);
  const mPrevMonthDays = getDaysInMonth(mYear, mMonth - 1);
  
  const modalCalendarDays = [];
  for (let i = mFirstDay - 1; i >= 0; i--) modalCalendarDays.push({ day: mPrevMonthDays - i, isCurrent: false, dateStr: null });
  for (let i = 1; i <= mDaysInMonth; i++) {
    modalCalendarDays.push({ day: i, isCurrent: true, dateStr: `${mYear}-${(mMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}` });
  }
  const mTotalCells = Math.ceil(modalCalendarDays.length / 7) * 7;
  for (let i = 1; i <= mTotalCells - modalCalendarDays.length; i++) modalCalendarDays.push({ day: i, isCurrent: false, dateStr: null });

  const prevModalMonth = () => setModalMonthDate(new Date(mYear, mMonth - 1, 1));
  const nextModalMonth = () => setModalMonthDate(new Date(mYear, mMonth + 1, 1));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header / View Toggle */}
      <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between border border-white">
        <h3 className="text-sm font-bold text-slate-900">
          {viewMode === 'Semanal' ? 'Visão Geral da Semana' : `Agenda do Dia - ${formatDateLabel(selectedDateIso)}`}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('Diária')}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${viewMode === 'Diária' ? 'bg-primary text-white font-bold shadow-sm' : 'bg-white border border-slate-200 font-medium text-slate-700 hover:bg-slate-50'}`}
          >
            Visualização Diária
          </button>
          <button 
            onClick={() => setViewMode('Semanal')}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${viewMode === 'Semanal' ? 'bg-primary text-white font-bold shadow-sm' : 'bg-white border border-slate-200 font-medium text-slate-700 hover:bg-slate-50'}`}
          >
            Semanal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDE: WIDGET (Month Calendar or Daily Timeline) */}
        <div className="lg:col-span-4">
          {viewMode === 'Semanal' ? (
            /* Monthly Calendar Widget */
            <div className="bg-surface-container-lowest border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">{monthNames[month]} {year}</h2>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="p-1 hover:bg-slate-50 border border-slate-200 rounded text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={nextMonth} className="p-1 hover:bg-slate-50 border border-slate-200 rounded text-slate-500"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-xs">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <span key={i} className="font-bold text-on-surface-variant/70">{d}</span>
                ))}
                {calendarDays.map((c, i) => {
                  if (!c.isCurrent) return <div key={`empty-${i}`} className="flex items-center justify-center h-8"><span className="text-slate-300">{c.day}</span></div>;
                  
                  const dayEvents = getEventsForDate(c.dateStr!);
                  const isSelected = c.dateStr === selectedDateIso;
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <div 
                      key={i} 
                      onClick={() => { setSelectedDateIso(c.dateStr!); setViewMode('Diária'); }}
                      className="flex flex-col items-center justify-center h-8 relative group cursor-pointer"
                    >
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 ${
                        isSelected ? 'bg-primary text-white font-bold shadow-sm' : 
                        hasEvents ? 'bg-slate-100 text-primary font-bold ring-1 ring-slate-200 group-hover:bg-primary/10' : 
                        'text-slate-700 hover:bg-slate-50'
                      }`}>
                        {c.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Categorias</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryColors).map(([name, color]) => (
                    <span key={name} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${color}`}></span> {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Mini Daily Timeline Widget */
            <div className="bg-surface-container-lowest border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[600px]">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white shrink-0">
                <button onClick={() => changeDay(-1)} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 border border-slate-200"><ChevronLeft className="w-4 h-4" /></button>
                <h2 className="text-sm font-bold text-slate-900">{formatDateLabel(selectedDateIso)}</h2>
                <button onClick={() => changeDay(1)} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 border border-slate-200"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="relative flex-1 overflow-y-auto bg-white p-2">
                {(() => {
                  let startHour = 8;
                  let endHour = 18;
                  if (dailyEvents.length > 0) {
                    let minH = 24;
                    let maxH = 0;
                    dailyEvents.forEach(evt => {
                      const [start, end] = evt.time.split(' - ');
                      const sh = parseInt(start.split(':')[0], 10);
                      const eh = parseInt(end.split(':')[0], 10);
                      const em = parseInt(end.split(':')[1], 10);
                      if (sh < minH) minH = sh;
                      if (eh > maxH || (eh === maxH && em > 0)) maxH = em > 0 ? eh + 1 : eh;
                    });
                    startHour = minH;
                    endHour = maxH;
                  }
                  if (endHour <= startHour) endHour = startHour + 1;
                  
                  const displayHours = [];
                  for (let h = startHour; h <= endHour; h++) {
                    displayHours.push(h);
                  }
                  
                  const timelineHeight = (endHour - startHour) * 40 + 20;

                  return (
                    <div className="relative w-full" style={{ height: `${timelineHeight}px` }}>
                      {/* Background Grid Lines & Hour Labels */}
                      {displayHours.map((h) => {
                        const top = (h - startHour) * 40;
                        return (
                          <div key={h} className="absolute w-full flex items-start" style={{ top: `${top}px` }}>
                            <span className="w-10 flex-shrink-0 text-[10px] font-bold text-slate-400 text-right pr-2 -mt-1.5">{`${h.toString().padStart(2, '0')}:00`}</span>
                            <div className="flex-1 border-t border-slate-50 h-full mt-0.5"></div>
                          </div>
                        );
                      })}
                      
                      {/* Render Event Blocks in Mini Timeline */}
                      {dailyEvents.map(evt => {
                        const [start, end] = evt.time.split(' - ');
                        const [sh, sm] = start.split(':').map(Number);
                        const [eh, em] = end.split(':').map(Number);
                        
                        const top = ((sh - startHour) + sm / 60) * 40;
                        let height = ((eh * 60 + em) - (sh * 60 + sm)) / 60 * 40;
                        if (height < 20) height = 20;

                        return (
                          <div 
                            key={evt.id} 
                            className={`absolute left-10 right-2 rounded p-1.5 ${categoryColors[evt.category] || 'bg-slate-400'} shadow-sm cursor-pointer overflow-hidden group hover:opacity-90 transition-opacity`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            onClick={() => handleEdit(evt)}
                          >
                            <p className="text-white font-bold text-[10px] leading-tight line-clamp-2">{evt.title}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Upcoming Schedule list */}
        <div className="lg:col-span-8 space-y-4">
          {(() => {
            if (loading) return <div className="text-center p-8 text-slate-500 bg-surface-container-lowest rounded-xl border border-slate-100">Carregando agenda...</div>;

            const displayedEvents = viewMode === 'Diária' 
              ? events.filter(e => e.isoDate === selectedDateIso).sort((a,b) => a.time.localeCompare(b.time))
              : events.sort((a,b) => a.isoDate.localeCompare(b.isoDate));

            if (displayedEvents.length === 0) return <div className="text-center p-8 text-slate-500 bg-surface-container-lowest rounded-xl border border-slate-100">Nenhum evento agendado {viewMode === 'Diária' ? 'para este dia' : 'na semana'}.</div>;
            
            return displayedEvents.map((evt) => (
              <div key={evt.id} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className={`absolute left-0 top-0 w-1 h-full ${categoryColors[evt.category] || 'bg-slate-400'}`}></div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">{formatDateLabel(evt.isoDate)}</span>
                    <span className="h-3 w-[1px] bg-slate-200"></span>
                    <span className="text-[10px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded uppercase">{evt.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">{evt.title}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {evt.time}</span>
                    <span className="flex items-center gap-1">
                      {evt.type === 'Online' ? <Video className="w-3.5 h-3.5 text-slate-400" /> : <MapPin className="w-3.5 h-3.5 text-slate-400" />} 
                      {evt.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start md:self-center">
                  <button onClick={() => handleEdit(evt)} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => confirmDelete(evt.id)} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ));
          })()}
        </div>

      </div>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? 'Editar Evento' : 'Novo Evento'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Open Calendar */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <button type="button" onClick={prevModalMonth} className="p-1 hover:bg-slate-200 rounded text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{monthNames[mMonth]} {mYear}</span>
                  <button type="button" onClick={nextModalMonth} className="p-1 hover:bg-slate-200 rounded text-slate-600"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['D','S','T','Q','Q','S','S'].map((d, idx) => <span key={`h-${d}-${idx}`} className="font-bold text-slate-400 mb-1">{d}</span>)}
                  {modalCalendarDays.map((c, i) => (
                    <button 
                      type="button"
                      key={`md-${i}`} 
                      onClick={() => c.isCurrent && setFormData({...formData, isoDate: c.dateStr!})}
                      disabled={!c.isCurrent}
                      className={`w-7 h-7 flex items-center justify-center rounded-full mx-auto transition-colors ${
                        formData.isoDate === c.dateStr ? 'bg-primary text-white font-bold shadow-sm' : 
                        c.isCurrent ? 'text-slate-700 hover:bg-slate-200 bg-white' : 'text-transparent'
                      }`}
                    >
                      {c.isCurrent ? c.day : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right: Time, Location, Category */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário (Início - Fim)</label>
                <div className="flex items-center gap-2">
                  <select 
                    value={formData.time?.split(' - ')[0] || '10:00'} 
                    onChange={e => setFormData({...formData, time: `${e.target.value} - ${formData.time?.split(' - ')[1] || '11:00'}`})} 
                    className="w-full px-3 py-2 border rounded-lg outline-none bg-white text-sm text-slate-700"
                  >
                    {timeOptions.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                  </select>
                  <span className="text-slate-400 text-sm">até</span>
                  <select 
                    value={formData.time?.split(' - ')[1] || '11:00'} 
                    onChange={e => setFormData({...formData, time: `${formData.time?.split(' - ')[0] || '10:00'} - ${e.target.value}`})} 
                    className="w-full px-3 py-2 border rounded-lg outline-none bg-white text-sm text-slate-700"
                  >
                    {timeOptions.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Localização/Link</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <button 
                  type="button" 
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)} 
                  className="w-full px-4 py-2 border rounded-lg bg-white flex items-center justify-between text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${categoryColors[formData.category || 'Geral']}`}></span>
                    <span className="text-sm">{formData.category || 'Geral'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                
                {isCategoryOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl py-1">
                    {Object.entries(categoryColors).map(([cat, colorClass]) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: cat });
                          setIsCategoryOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors"
                      >
                        <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
                        <span className="text-sm">{cat}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t mt-6">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-slate-700">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">Salvar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Evento">
        <div className="space-y-4">
          <p className="text-slate-600">Deseja mesmo cancelar e excluir este evento?</p>
          <div className="pt-4 flex justify-end gap-2 border-t mt-6">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

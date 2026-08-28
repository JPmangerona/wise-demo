import api from './api';

export type MovementOrigin = 'MANUAL' | 'API_TRIBUNAL' | 'API_INFOSIMPLES' | 'API_DATAJUD';
export type MovementStatus = 'PENDING' | 'VALIDATED';

export interface MovementItem {
  id: string;
  processId: string;
  date: string; // ex: "22/08/2026, 17:55"
  origin: MovementOrigin;
  description: string;
  status: MovementStatus;
}

export interface ProcessGroup {
  id: string;
  processName: string;
  clientName: string;
  adverseParty: string;
  courtCity: string;
  movements: MovementItem[];
}

export const MOVEMENT_UPDATE_EVENT = 'wise-process-groups-updated';

export async function getStoredProcessGroups(): Promise<ProcessGroup[]> {
  try {
    const res = await api.get('/processes/groups');
    return res.data || [];
  } catch (err) {
    console.error('Erro ao buscar movimentações do banco:', err);
    return [];
  }
}

export async function addMovementToProcessGroup(
  processId: string,
  processName: string,
  clientName: string,
  adverseParty: string,
  courtCity: string,
  date: string,
  origin: MovementOrigin,
  description: string
): Promise<MovementItem> {
  try {
    const res = await api.post(`/processes/${processId}/movements`, {
      date,
      origin: origin.toUpperCase(),
      description,
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(MOVEMENT_UPDATE_EVENT));
    }
    
    return res.data;
  } catch (err) {
    console.error('Erro ao adicionar movimentação no banco:', err);
    throw err;
  }
}

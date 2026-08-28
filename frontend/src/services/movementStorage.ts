export type MovementOrigin = 'MANUAL' | 'API_TRIBUNAL';
export type MovementStatus = 'PENDING' | 'VALIDATED';

export interface MovementItem {
  id: string;
  processId: string;
  date: string; // ex: "22/08/2026 17:55"
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

const STORAGE_KEY = 'wise_process_groups';
export const MOVEMENT_UPDATE_EVENT = 'wise-process-groups-updated';

export const initialProcessGroups: ProcessGroup[] = [];

export function getStoredProcessGroups(): ProcessGroup[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler movimentações salvas:', err);
    return [];
  }
}

export function saveStoredProcessGroups(groups: ProcessGroup[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    window.dispatchEvent(new Event(MOVEMENT_UPDATE_EVENT));
  } catch (err) {
    console.error('Erro ao salvar movimentações:', err);
  }
}

export function updateProcessGroupInfo(
  processId: string,
  info: {
    processName?: string;
    clientName?: string;
    adverseParty?: string;
    courtCity?: string;
  }
): void {
  const groups = getStoredProcessGroups();
  let groupFound = false;
  const updatedGroups = groups.map((g) => {
    if (g.id === processId) {
      groupFound = true;
      return {
        ...g,
        processName: info.processName !== undefined ? (info.processName || '-') : g.processName,
        clientName: info.clientName !== undefined ? (info.clientName || '-') : g.clientName,
        adverseParty: info.adverseParty !== undefined ? (info.adverseParty || '-') : g.adverseParty,
        courtCity: info.courtCity !== undefined ? (info.courtCity || '-') : g.courtCity,
      };
    }
    return g;
  });

  if (!groupFound && info.processName) {
    updatedGroups.push({
      id: processId,
      processName: info.processName || 'Sem Título',
      clientName: info.clientName || '-',
      adverseParty: info.adverseParty || '-',
      courtCity: info.courtCity || '-',
      movements: [],
    });
  }

  saveStoredProcessGroups(updatedGroups);
}

export function addMovementToProcessGroup(
  processId: string,
  processName: string,
  clientName: string,
  adverseParty: string,
  courtCity: string,
  date: string,
  origin: MovementOrigin,
  description: string
): MovementItem {
  const groups = getStoredProcessGroups();
  const newMov: MovementItem = {
    id: `mov-${Date.now()}`,
    processId,
    date,
    origin,
    description,
    status: 'PENDING',
  };

  let groupFound = false;
  const updatedGroups = groups.map((g) => {
    if (g.id === processId) {
      groupFound = true;
      return {
        ...g,
        processName: (processName && processName !== 'Sem Título') ? processName : g.processName,
        clientName: (clientName && clientName !== '-') ? clientName : g.clientName,
        adverseParty: (adverseParty && adverseParty !== '-') ? adverseParty : g.adverseParty,
        courtCity: (courtCity && courtCity !== '- - -') ? courtCity : g.courtCity,
        movements: [newMov, ...g.movements],
      };
    }
    return g;
  });

  if (!groupFound) {
    updatedGroups.push({
      id: processId,
      processName: processName || 'Sem Título',
      clientName: clientName || '-',
      adverseParty: adverseParty || '-',
      courtCity: courtCity || '-',
      movements: [newMov],
    });
  }

  saveStoredProcessGroups(updatedGroups);
  return newMov;
}

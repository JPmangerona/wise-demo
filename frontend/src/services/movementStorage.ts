export type MovementOrigin = 'MANUAL' | 'API_TRIBUNAL' | 'API_INFOSIMPLES' | 'API_DATAJUD';
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

function convertDateToBr(dateStr: string): string {
  if (!dateStr) return dateStr;
  
  // Format: "MM/DD/YYYY, hh:mm AM/PM"
  // Example: "06/18/2025, 09:25 AM"
  const isUsFormat = dateStr.includes('AM') || dateStr.includes('PM');
  if (!isUsFormat) return dateStr;

  try {
    const parts = dateStr.trim().split(' ');
    if (parts.length < 3) return dateStr;
    
    const datePart = parts[0].replace(',', '');
    const timePart = parts[1];
    const ampm = parts[2];
    
    const dateParts = datePart.split('/');
    if (dateParts.length !== 3) return dateStr;
    
    const month = dateParts[0];
    const day = dateParts[1];
    const year = dateParts[2];
    
    const timeParts = timePart.split(':');
    if (timeParts.length !== 2) return dateStr;
    
    let hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const formattedHours = hours.toString().padStart(2, '0');
    return `${day}/${month}/${year}, ${formattedHours}:${minutes}`;
  } catch (err) {
    console.error('Erro ao converter data para formato BR:', err);
    return dateStr;
  }
}

export function getStoredProcessGroups(): ProcessGroup[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const groups: ProcessGroup[] = JSON.parse(data);

    // Sanitizar IDs duplicados e datas para formato BR
    let hasChanges = false;
    const seenIds = new Set<string>();

    const sanitizedGroups = groups.map((g) => {
      const sanitizedMovements = g.movements.map((m) => {
        const updatedMov = { ...m };
        
        // Converter data para BR se estiver no formato americano com AM/PM
        const brDate = convertDateToBr(m.date);
        if (brDate !== m.date) {
          hasChanges = true;
          updatedMov.date = brDate;
        }

        // Sanitizar IDs duplicados
        if (!m.id || seenIds.has(m.id)) {
          hasChanges = true;
          const uniqueId = `mov-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          seenIds.add(uniqueId);
          updatedMov.id = uniqueId;
        } else {
          seenIds.add(m.id);
        }

        return updatedMov;
      });
      return { ...g, movements: sanitizedMovements };
    });

    if (hasChanges) {
      // Salvar de volta de forma silenciosa sem disparar o evento de atualização global para evitar loops
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedGroups));
      } catch (err) {
        console.error('Erro ao salvar movimentações sanitizadas:', err);
      }
    }

    return sanitizedGroups;
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
    id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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

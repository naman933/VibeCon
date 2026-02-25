import { createContext, useContext, useState, useCallback } from 'react';
import * as storage from '../services/storage';
import { calculatePriority } from '../services/priorityEngine';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [ver, setVer] = useState(0);
  const bump = useCallback(() => setVer(v => v + 1), []);

  const queries = storage.getQueries();
  const cycles = storage.getCycles();
  const uploads = storage.getUploads();
  const users = storage.getUsers();
  const activeCycle = cycles.find(c => c.isActive) || null;

  const addCycle = (cycle) => {
    const updated = [...cycles, { ...cycle, id: Date.now().toString(), isActive: false }];
    storage.setCycles(updated);
    bump();
  };

  const setActiveCycle = (id) => {
    const updated = cycles.map(c => ({ ...c, isActive: c.id === id }));
    storage.setCycles(updated);
    bump();
  };

  const importQueries = (newQueries, fileName, uploadedBy) => {
    const existing = storage.getQueries();
    const existingIds = new Set(existing.map(q => q.ticketId));
    const members = users.filter(u => u.role === 'AdCom Member');

    let imported = 0;
    const toAdd = [];

    newQueries.forEach(q => {
      if (!q.ticketId || existingIds.has(q.ticketId)) return;

      let assignedTo = '';
      if (members.length > 0) {
        const counts = {};
        members.forEach(m => { counts[m.username] = 0; });
        [...existing, ...toAdd].forEach(eq => {
          if (eq.assignedTo && counts[eq.assignedTo] !== undefined &&
              eq.internalStatus !== 'Resolved' && eq.internalStatus !== 'Spam') {
            counts[eq.assignedTo]++;
          }
        });
        const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);
        assignedTo = sorted[0]?.[0] || '';
      }

      const priority = calculatePriority(q);
      toAdd.push({
        ticketId: String(q.ticketId),
        referenceTicketId: q.referenceTicketId || '',
        candidateName: q.candidateName || '',
        merittoCategory: q.merittoCategory || '',
        createdDate: q.createdDate || new Date().toISOString(),
        merittoStatus: q.merittoStatus || '',
        description: q.description || '',
        assignedTo,
        internalStatus: 'New',
        cycle: activeCycle?.name || 'No Active Cycle',
        priorityScore: priority.priorityScore,
        priorityLevel: priority.priorityLevel,
        aiCategory: '',
        aiConfidenceScore: null,
        aiSummary: '',
        aiIntentTags: '',
        aiUrgencyTag: '',
        aiDraftResponse: '',
        closureDate: null,
        tat: null,
        escalationFlag: false,
        escalationReason: '',
        adminResolution: '',
        reassignmentHistory: [],
        slaBreachFlag: false,
        updatedDate: q.updatedDate || '',
        firstClosureDate: q.firstClosureDate || '',
        lastReplyBy: q.lastReplyBy || '',
        leadId: q.leadId || '',
        feedbackScore: q.feedbackScore || '',
        originalAssignedTo: q.originalAssignedTo || '',
      });
      imported++;
    });

    storage.setQueries([...existing, ...toAdd]);

    const uploadLog = {
      id: Date.now().toString(),
      fileName,
      uploadedBy,
      dateTime: new Date().toISOString(),
      recordsImported: imported,
      cycle: activeCycle?.name || 'No Active Cycle',
    };
    storage.setUploads([...uploads, uploadLog]);
    bump();
    return imported;
  };

  const updateQuery = (ticketId, updates) => {
    const all = storage.getQueries();
    const idx = all.findIndex(q => q.ticketId === String(ticketId));
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updates };
      storage.setQueries(all);
      bump();
    }
  };

  const addUser = (user) => {
    const updated = [...users, { ...user, id: Date.now().toString() }];
    storage.setUsers(updated);
    bump();
  };

  const updateUser = (id, updates) => {
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    storage.setUsers(updated);
    bump();
  };

  return (
    <DataContext.Provider value={{
      queries, cycles, uploads, users, activeCycle, ver,
      addCycle, setActiveCycle,
      importQueries, updateQuery,
      addUser, updateUser, bump,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

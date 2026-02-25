const KEYS = {
  USERS: 'aqis_users',
  SESSION: 'aqis_session',
  CYCLES: 'aqis_cycles',
  QUERIES: 'aqis_queries',
  UPLOADS: 'aqis_uploads',
};

const SEED_USERS = [
  { id: '1', username: 'admin', password: 'admin123', role: 'Admin', name: 'Admin User', email: 'admin@aqis.edu', isAdminAccess: true },
  { id: '2', username: 'member1', password: 'member123', role: 'AdCom Member', name: 'Committee Member 1', email: 'member1@aqis.edu', isAdminAccess: false },
];

const get = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const initStorage = () => {
  if (!get(KEYS.USERS)) set(KEYS.USERS, SEED_USERS);
  if (!get(KEYS.CYCLES)) set(KEYS.CYCLES, []);
  if (!get(KEYS.QUERIES)) set(KEYS.QUERIES, []);
  if (!get(KEYS.UPLOADS)) set(KEYS.UPLOADS, []);
};

// Users
export const getUsers = () => get(KEYS.USERS) || SEED_USERS;
export const setUsers = (users) => set(KEYS.USERS, users);
export const authenticate = (username, password) => {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password) || null;
};

// Session
export const getSession = () => get(KEYS.SESSION);
export const setSession = (s) => set(KEYS.SESSION, s);
export const clearSession = () => localStorage.removeItem(KEYS.SESSION);

// Cycles
export const getCycles = () => get(KEYS.CYCLES) || [];
export const setCycles = (c) => set(KEYS.CYCLES, c);
export const getActiveCycle = () => getCycles().find(c => c.isActive);

// Queries
export const getQueries = () => get(KEYS.QUERIES) || [];
export const setQueries = (q) => set(KEYS.QUERIES, q);

// Uploads
export const getUploads = () => get(KEYS.UPLOADS) || [];
export const setUploads = (u) => set(KEYS.UPLOADS, u);

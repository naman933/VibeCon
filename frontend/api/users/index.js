const bcrypt = require('bcryptjs');
const { setCors, supabaseQuery } = require('../_supabase');
const crypto = require('crypto');

function formatUser(u) {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email || '',
    role: u.role,
    isAdminAccess: u.is_admin_access,
    isAvailable: u.is_available != null ? u.is_available : true,
  };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET /api/users — list all users
    if (req.method === 'GET') {
      const { data, ok } = await supabaseQuery('users?select=id,username,name,email,role,is_admin_access,is_available&order=created_at.asc');
      if (!ok) return res.status(500).json({ detail: 'Failed to fetch users' });
      return res.status(200).json(data.map(formatUser));
    }

    // POST /api/users — create user
    if (req.method === 'POST') {
      const { name, username, password, email, role, isAdminAccess, isAvailable } = req.body || {};
      if (!name || !username || !password) {
        return res.status(400).json({ detail: 'Name, username, and password are required' });
      }

      // Check uniqueness
      const { data: existing } = await supabaseQuery(`users?username=eq.${encodeURIComponent(username)}&select=id`);
      if (existing && existing.length > 0) {
        return res.status(400).json({ detail: 'Username already exists' });
      }

      const hash = await bcrypt.hash(password, 10);
      const newUser = {
        id: crypto.randomUUID(),
        username,
        password_hash: hash,
        name,
        email: email || '',
        role: role || 'AdCom Member',
        is_admin_access: isAdminAccess || false,
        is_available: isAvailable != null ? isAvailable : true,
      };

      const { data, ok } = await supabaseQuery('users', {
        method: 'POST',
        body: newUser,
        prefer: 'return=representation',
      });

      if (!ok) return res.status(500).json({ detail: 'Failed to create user' });
      return res.status(200).json(formatUser(Array.isArray(data) ? data[0] : data));
    }

    return res.status(405).json({ detail: 'Method not allowed' });
  } catch (err) {
    console.error('Users error:', err);
    return res.status(500).json({ detail: 'Internal server error' });
  }
}

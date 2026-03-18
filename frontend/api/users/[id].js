const bcrypt = require('bcryptjs');
const { setCors, supabaseQuery } = require('../_supabase');

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

  const { id } = req.query;
  if (!id) return res.status(400).json({ detail: 'User ID is required' });

  try {
    // PUT /api/users/[id] — update user
    if (req.method === 'PUT') {
      const { name, email, role, isAdminAccess, isAvailable, password } = req.body || {};
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;
      if (role !== undefined) updates.role = role;
      if (isAdminAccess !== undefined) updates.is_admin_access = isAdminAccess;
      if (isAvailable !== undefined) updates.is_available = isAvailable;
      if (password) updates.password_hash = await bcrypt.hash(password, 10);

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ detail: 'No updates provided' });
      }

      const { data, ok } = await supabaseQuery(`users?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: updates,
        prefer: 'return=representation',
      });

      if (!ok || !data || data.length === 0) {
        return res.status(404).json({ detail: 'User not found' });
      }
      return res.status(200).json(formatUser(data[0]));
    }

    // DELETE /api/users/[id] — delete user
    if (req.method === 'DELETE') {
      const { ok } = await supabaseQuery(`users?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!ok) return res.status(404).json({ detail: 'User not found' });
      return res.status(200).json({ success: true, message: 'User deleted' });
    }

    return res.status(405).json({ detail: 'Method not allowed' });
  } catch (err) {
    console.error('User update error:', err);
    return res.status(500).json({ detail: 'Internal server error' });
  }
}

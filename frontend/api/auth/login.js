const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { setCors, supabaseQuery } = require('../_supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'aqis-jwt-secret-key-2026-secure';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ detail: 'Username and password are required' });
  }

  try {
    const { data: users, ok } = await supabaseQuery(`users?username=eq.${encodeURIComponent(username)}&select=*`);

    if (!ok || !users || users.length === 0) {
      return res.status(401).json({ detail: 'Invalid username or password' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ detail: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email || '',
        role: user.role,
        isAdminAccess: user.is_admin_access,
        isAvailable: user.is_available != null ? user.is_available : true,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ detail: 'Internal server error' });
  }
}

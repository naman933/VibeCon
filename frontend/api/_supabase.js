// Shared Supabase helper for Vercel serverless functions
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Keepalive-Token');
}

async function supabaseQuery(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || '',
    ...options.headers,
  };

  const resp = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.prefer?.includes('return=representation')) {
    const data = await resp.json();
    return { data, status: resp.status, ok: resp.ok };
  }

  if (resp.status === 204 || resp.headers.get('content-length') === '0') {
    return { data: null, status: resp.status, ok: resp.ok };
  }

  const data = await resp.json();
  return { data, status: resp.status, ok: resp.ok };
}

module.exports = { setCors, supabaseQuery, SUPABASE_URL, SUPABASE_KEY };

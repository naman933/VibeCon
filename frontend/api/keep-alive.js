const { setCors, supabaseQuery } = require('./_supabase');

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  const token = req.headers['x-keepalive-token'];
  const secret = process.env.KEEPALIVE_SECRET;

  if (!secret || token !== secret) {
    return res.status(403).json({ detail: 'Forbidden' });
  }

  try {
    // Update heartbeat via Supabase REST API
    const { data: existing } = await supabaseQuery('heartbeat?id=eq.1&select=id');

    if (existing && existing.length > 0) {
      await supabaseQuery('heartbeat?id=eq.1', {
        method: 'PATCH',
        body: { last_ping: new Date().toISOString(), source: 'github_actions' },
      });
    } else {
      await supabaseQuery('heartbeat', {
        method: 'POST',
        body: { last_ping: new Date().toISOString(), source: 'github_actions' },
      });
    }

    const { data } = await supabaseQuery('heartbeat?id=eq.1&select=*');
    const hb = data?.[0];
    return res.status(200).json({
      status: 'alive',
      last_ping: hb?.last_ping || null,
      source: hb?.source || null,
    });
  } catch (err) {
    console.error('Keep-alive error:', err);
    return res.status(500).json({ detail: 'Internal server error' });
  }
}

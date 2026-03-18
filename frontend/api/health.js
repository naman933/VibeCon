const { setCors, supabaseQuery } = require('./_supabase');

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { data } = await supabaseQuery('heartbeat?id=eq.1&select=*');
    const hb = data?.[0];
    return res.status(200).json({
      status: 'healthy',
      db_connected: true,
      last_heartbeat: hb?.last_ping || null,
    });
  } catch (err) {
    return res.status(200).json({
      status: 'degraded',
      db_connected: false,
      last_heartbeat: null,
    });
  }
}

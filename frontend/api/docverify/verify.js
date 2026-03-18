const { setCors } = require('../_supabase');

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(501).json({
    detail: 'Document Verification requires the full Python backend with pdfplumber. This feature is available on the Emergent preview deployment. For Vercel, consider deploying the backend separately on Railway or Render.',
  });
}

import { setCors, supabaseQuery } from '../_supabase';

// Document verification is only supported on the Emergent preview environment
// which runs the full Python backend with pdfplumber for accurate PDF parsing.
// This endpoint returns a clear message for Vercel deployments.

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(501).json({
    detail: 'Document Verification requires the full backend (Python + pdfplumber). This feature is available on the Emergent preview deployment but not on Vercel serverless. Consider deploying the backend on Railway or Render for full functionality.',
  });
}

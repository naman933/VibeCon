# AQIS - Admissions Query Intelligence System

## Problem Statement
Build a full-stack Admissions Query Intelligence System with React + Tailwind CSS, localStorage persistence, Excel upload (SheetJS), Groq AI analysis, and comprehensive query management.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Recharts
- **Backend**: FastAPI (Groq AI proxy only)
- **Data**: localStorage (all persistence client-side)
- **AI**: Groq REST API via backend proxy (llama-3.3-70b-versatile)
- **Excel Parsing**: SheetJS (xlsx library)
- **CSV Export**: PapaParse

## User Personas
1. **Admin** - Full access: manage cycles, users, view all queries, resolve escalations, view analytics/reports
2. **AdCom Member** - View assigned queries, resolve/escalate, personal analytics

## Core Requirements
- Authentication with role-based access (Admin, AdCom Member)
- Admission cycle management
- Excel (.xlsx) data upload with automatic query assignment
- Priority engine (category weight + days pending + escalation)
- Query detail drawer with Groq AI analysis
- Escalation queue and repository
- SLA monitoring (2+ days breach)
- Analytics dashboard with Recharts
- CSV report exports (6 report types)
- User management with admin access toggle
- Dark/light theme toggle

## What's Been Implemented (Feb 2026)
- [x] Login page with split-screen design
- [x] Navy sidebar with collapsible navigation
- [x] Header with active cycle badge, theme toggle
- [x] Admission Cycle Management (create, set active)
- [x] Upload Data page with drag-and-drop Excel upload
- [x] Upload History page with cycle filter
- [x] All Queries page (Admin) with 5 filter types + search
- [x] My Assigned Queries page (AdCom Member)
- [x] Query Detail Drawer with AI analysis (Groq AI)
- [x] AI Panel: Summary, Intent & Urgency, Draft Response
- [x] Escalation Queue with admin resolve
- [x] Escalation Repository with search/filter
- [x] SLA Monitor with severity classification
- [x] Analytics Dashboard with KPI cards + Recharts charts
- [x] Reports page with 6 CSV export options
- [x] User Management with admin access toggle
- [x] Dark/light theme toggle
- [x] Priority engine (auto-calculate on upload)
- [x] Auto-assignment to AdCom members (load balancing)
- [x] Toast notifications (sonner)
- [x] Confirmation dialogs (Mark Spam, Resolve Escalation)
- [x] Empty state messages
- [x] SLA breach row highlighting
- [x] Similarity suggestions in drawer

## Vercel Deployment
- `frontend/vercel.json` configured with SPA rewrites
- `frontend/api/ai/analyze.js` serverless function for Groq AI proxy
- Set `REACT_APP_BACKEND_URL` to empty string `""` on Vercel
- Set `GROQ_API_KEY` in Vercel Environment Variables

## Prioritized Backlog
### P0 (Done)
- All core features implemented

### P1 (Next Phase)
- Date range filters on queries and analytics
- Bulk operations on queries (bulk resolve, reassign)
- Query reassignment with history tracking
- Export to Excel (in addition to CSV)

### P2 (Future)
- Document Verification module
- Interview Logistics module
- Email notifications for SLA breaches
- Advanced AI: semantic similarity search
- Dashboard widgets customization
- Audit trail / activity log

## Seed Data
- Admin: username=admin, password=admin123
- Member: username=member1, password=member123
- Sample Excel: https://customer-assets.emergentagent.com/job_aqis-admissions/artifacts/736b147f_Query%20dump%20data.xlsx

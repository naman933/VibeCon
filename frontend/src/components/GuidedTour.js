import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Upload, List, UserCheck, AlertTriangle, Archive, Clock,
  BarChart3, FileText, Users, Brain, CheckCircle2, Ban,
  CalendarDays, FileSpreadsheet, ChevronRight, ChevronLeft,
  Rocket, ShieldCheck, Zap, Target, ArrowRight, FileSearch,
  ToggleRight, UserCog
} from 'lucide-react';

const TOUR_KEY = 'aqis_tour_completed';

const adminSteps = [
  {
    icon: Rocket,
    color: 'bg-blue-500',
    title: 'Welcome to AQIS',
    subtitle: 'Your Admissions Query Intelligence System',
    description: 'AQIS helps you manage admissions queries with AI-powered analysis, automated prioritization, real-time SLA monitoring, document verification, and selective query assignment.',
    tips: [
      'The left sidebar is your main navigation',
      'User accounts are stored securely in Supabase database',
      'Dark/light theme toggle is in the top-right header',
    ],
    highlight: null,
  },
  {
    icon: CalendarDays,
    color: 'bg-indigo-500',
    title: 'Step 1: Create an Admission Cycle',
    subtitle: 'Upload Data page',
    description: 'Every query is tagged to an admission cycle. Before uploading any data, you need to create a cycle and set it as active.',
    tips: [
      'Go to Upload Data tab',
      'Click "+ New Cycle" to create a cycle (e.g., MBA 2025-26)',
      'Click the cycle chip to set it as Active',
      'The "Required" badge disappears once a cycle is active',
    ],
    highlight: '/upload',
  },
  {
    icon: Upload,
    color: 'bg-emerald-500',
    title: 'Step 2: Upload Query Data',
    subtitle: 'Upload Data page',
    description: 'Upload your Excel (.xlsx) file exported from Meritto. The system parses the data, skips duplicates, and assigns queries to members in the active assignment pool.',
    tips: [
      'Drag & drop or click to browse for the .xlsx file',
      'Step 3 "Assignment Pool" shows who will receive queries',
      'Click "Override" to include/exclude specific members for this upload',
      'Priority is calculated based on category weight + days pending',
    ],
    highlight: '/upload',
  },
  {
    icon: List,
    color: 'bg-blue-500',
    title: 'Step 3: Review All Queries',
    subtitle: 'All Queries page (Admin only)',
    description: 'View the complete query table with powerful filters. Each row shows ticket ID, candidate name, category, priority badge, days pending, assigned member, status, and SLA status.',
    tips: [
      'Filter by Cycle, Member, Category, Priority, or Status',
      'Search by Ticket ID, Name, or Description',
      'RED rows indicate SLA breaches (2+ days pending)',
      'Click any row to open the Query Detail Drawer',
    ],
    highlight: '/all-queries',
  },
  {
    icon: Brain,
    color: 'bg-violet-500',
    title: 'Step 4: AI-Powered Analysis',
    subtitle: 'Query Detail Drawer',
    description: 'When you open a query, the AI automatically analyzes the candidate\'s message. It generates a summary, detects intent & urgency, and drafts a response you can copy and use.',
    tips: [
      'AI Summary: 2-3 sentence plain English summary',
      'Intent Detection: categorizes the query type (Payment, Eligibility, etc.)',
      'Urgency Assessment: High / Medium / Low with reasoning',
      'Draft Response: editable template you can copy to reply on Meritto',
    ],
    highlight: '/all-queries',
  },
  {
    icon: CheckCircle2,
    color: 'bg-green-500',
    title: 'Step 5: Take Action on Queries',
    subtitle: 'Query Detail Drawer',
    description: 'From the detail drawer, you can take three actions on each query. Choose the appropriate action based on the query content and AI analysis.',
    tips: [
      'Mark Resolved: closes the query and records TAT',
      'Flag to Admin: escalates with a reason to the Escalation Queue',
      'Mark Spam: excludes from SLA tracking and analytics',
      'All actions show toast confirmations',
    ],
    highlight: null,
  },
  {
    icon: AlertTriangle,
    color: 'bg-amber-500',
    title: 'Step 6: Handle Escalations',
    subtitle: 'Escalation Queue + Repository',
    description: 'When members flag queries, they appear in the Escalation Queue. As an admin, you review them, write a resolution, and close them. Resolved escalations are archived in the Repository.',
    tips: [
      'Escalation Queue: pending escalations needing admin resolution',
      'Click "Resolve" to write your resolution and close',
      'Escalation Repository: searchable archive of all resolutions',
      'Repository helps members find answers to similar queries',
    ],
    highlight: '/escalation-queue',
  },
  {
    icon: Clock,
    color: 'bg-red-500',
    title: 'Step 7: Monitor SLA Compliance',
    subtitle: 'SLA Monitor page',
    description: 'The SLA Monitor shows all non-resolved queries pending 2 or more days. It helps you identify bottlenecks and ensure timely responses.',
    tips: [
      'Summary cards: Total Breaches, Critical (3+ days), At Risk (2 days)',
      'Critical queries get a deeper red highlight',
      'Focus on resolving critical queries first',
      'Resolved and Spam queries are excluded from SLA tracking',
    ],
    highlight: '/sla-monitor',
  },
  {
    icon: BarChart3,
    color: 'bg-cyan-500',
    title: 'Step 8: Analytics & Reports',
    subtitle: 'Analytics + Reports pages',
    description: 'Track performance with KPI cards, category distribution charts, and member workload visualization. Export data as CSV reports for offline analysis.',
    tips: [
      'Analytics: Active queries, High priority count, SLA breaches, Avg TAT, Escalation rate',
      'Charts: Category donut chart + Member workload bar chart',
      'Reports: 6 export options (Open, Closed, SLA, Performance, Escalations, Full Summary)',
      'Filter analytics by cycle for period-specific insights',
    ],
    highlight: '/analytics',
  },
  {
    icon: Users,
    color: 'bg-pink-500',
    title: 'Step 9: Manage Your Team',
    subtitle: 'User Management page (Admin only)',
    description: 'Add, edit, and delete team members. Control admin access and manage who is available for query assignment. All user data is stored in the Supabase database.',
    tips: [
      'Add User: create new accounts with name, email, username, and role',
      'Delete User: remove accounts that are no longer needed',
      'Available toggle: controls if a member receives new query assignments',
      'Open Queries column: see each member\'s current workload at a glance',
    ],
    highlight: '/user-management',
  },
  {
    icon: ToggleRight,
    color: 'bg-orange-500',
    title: 'Step 10: Selective Query Assignment',
    subtitle: 'User Management + Upload Data pages',
    description: 'Control which members receive queries. Set permanent availability in User Management, or use per-upload overrides on the Upload Data page for temporary adjustments.',
    tips: [
      'User Management: toggle the "Available" switch to exclude a member',
      'Toggling off auto-redistributes their open queries to available members',
      'Upload Data: click "Override" in the Assignment Pool to adjust for one upload',
      'Overrides are temporary and don\'t change permanent settings',
    ],
    highlight: '/user-management',
  },
  {
    icon: FileSearch,
    color: 'bg-teal-500',
    title: 'Step 11: Document Verification',
    subtitle: 'Document Verification page',
    description: 'Bulk-verify candidate CAT scorecards (PDFs) against your Form A data (CSV/Excel). The system extracts registration numbers, percentiles, and other fields from scorecards and compares them automatically.',
    tips: [
      'Upload your Form A data (CSV or Excel) with candidate details',
      'Upload one or more CAT scorecard PDFs',
      'Click "Run Verification" to start the automated comparison',
      'View results as Verified, Discrepancy, Needs Review, or Missing Document',
      'Export the verification report as CSV or JSON',
    ],
    highlight: '/document-verification',
  },
];

const memberSteps = [
  {
    icon: Rocket,
    color: 'bg-blue-500',
    title: 'Welcome to AQIS',
    subtitle: 'Your Query Management Dashboard',
    description: 'AQIS helps you manage your assigned admissions queries efficiently with AI-powered analysis and document verification. This guide walks you through your workflow.',
    tips: [
      'The left sidebar is your main navigation',
      'Your admin uploads queries and assigns them to available members',
      'Dark/light theme toggle is in the top-right header',
    ],
    highlight: null,
  },
  {
    icon: UserCheck,
    color: 'bg-blue-500',
    title: 'Step 1: View Your Queries',
    subtitle: 'My Assigned Queries page',
    description: 'This is your primary workspace. It shows all queries assigned to you with their priority, status, days pending, and SLA status.',
    tips: [
      'Filter by status to focus on New or Open queries first',
      'Search by Ticket ID or candidate name',
      'RED rows indicate SLA breaches - prioritize these',
      'Click any row to open the detail drawer',
    ],
    highlight: '/my-queries',
  },
  {
    icon: Brain,
    color: 'bg-violet-500',
    title: 'Step 2: Use AI Analysis',
    subtitle: 'Query Detail Drawer',
    description: 'When you open a query, the AI automatically analyzes the candidate\'s message. Use the AI insights to understand the query faster and draft your response.',
    tips: [
      'AI Summary: quick overview of what the candidate needs',
      'Intent & Urgency: helps you prioritize your response',
      'Draft Response: pre-written reply you can edit and copy',
      'Click "Copy" to copy the draft, then reply on Meritto',
    ],
    highlight: '/my-queries',
  },
  {
    icon: Target,
    color: 'bg-green-500',
    title: 'Step 3: Take Action',
    subtitle: 'Query Detail Drawer',
    description: 'After reviewing the query and AI analysis, take the appropriate action.',
    tips: [
      'Mark Resolved: when you have responded to the candidate',
      'Flag to Admin: for complex queries needing admin intervention',
      'Mark Spam: for irrelevant or junk queries',
      'Provide a clear reason when escalating to admin',
    ],
    highlight: null,
  },
  {
    icon: Clock,
    color: 'bg-amber-500',
    title: 'Step 4: Stay on Top of SLA',
    subtitle: 'SLA Monitor page',
    description: 'Check the SLA Monitor regularly to ensure no query breaches the 2-day threshold. Critical queries (3+ days) need immediate attention.',
    tips: [
      'Review SLA Monitor daily to catch at-risk queries',
      'Aim to resolve queries within 1 day to stay well within SLA',
      'Escalate quickly if you cannot resolve within the timeline',
    ],
    highlight: '/sla-monitor',
  },
  {
    icon: BarChart3,
    color: 'bg-cyan-500',
    title: 'Step 5: Track Your Performance',
    subtitle: 'Analytics page',
    description: 'The Analytics page shows your personal KPIs: active queries, high priority count, SLA breaches, average TAT, and escalation rate.',
    tips: [
      'Aim for low Avg TAT (turnaround time)',
      'Monitor your SLA breach count - keep it at zero',
      'Check the Escalation Repository for solutions to similar past queries',
    ],
    highlight: '/analytics',
  },
  {
    icon: FileSearch,
    color: 'bg-teal-500',
    title: 'Step 6: Document Verification',
    subtitle: 'Document Verification page',
    description: 'Verify candidate CAT scorecards against Form A data. Upload the candidate list and scorecard PDFs to automatically compare registration numbers, percentiles, and more.',
    tips: [
      'Upload Form A data (CSV/Excel) and CAT scorecard PDFs',
      'Results show Verified, Discrepancy, Needs Review, or Missing Document',
      'Expand each row to see a side-by-side value comparison',
      'Export the report as CSV or JSON for records',
    ],
    highlight: '/document-verification',
  },
];

export default function GuidedTour({ open, onClose }) {
  const { isAdmin } = useAuth();
  const [step, setStep] = useState(0);
  const steps = isAdmin ? adminSteps : memberSteps;
  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const handleFinish = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => handleFinish()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0" data-testid="guided-tour-dialog">
        <DialogTitle className="sr-only">AQIS Guided Tour</DialogTitle>
        {/* Header gradient */}
        <div className={`${current.color} px-6 py-8 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -right-2 top-8 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <current.icon className="w-5 h-5 text-white" />
              </div>
              {!isFirst && (
                <span className="text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {step} of {steps.length - 1}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight">{current.title}</h2>
            {current.subtitle && (
              <p className="text-sm text-white/70 mt-1 flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3" /> {current.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90">{current.description}</p>

          {current.tips && current.tips.length > 0 && (
            <div className="space-y-2">
              {current.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{i + 1}</span>
                  </div>
                  <span className="text-muted-foreground leading-snug">{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'bg-blue-500 w-5' : i < step ? 'bg-blue-300 dark:bg-blue-700' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                data-testid={`tour-dot-${i}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {isFirst ? (
              <Button variant="ghost" size="sm" onClick={handleFinish} className="text-xs text-muted-foreground" data-testid="tour-skip-btn">
                Skip Tour
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} className="text-xs" data-testid="tour-prev-btn">
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={handleFinish} className="bg-blue-500 hover:bg-blue-600 text-white text-xs" data-testid="tour-finish-btn">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Got it!
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(s => s + 1)} className="bg-blue-500 hover:bg-blue-600 text-white text-xs" data-testid="tour-next-btn">
                {isFirst ? 'Start Tour' : 'Next'} <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { TOUR_KEY };

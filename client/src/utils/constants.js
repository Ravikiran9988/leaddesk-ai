export const BUDGET_OPTIONS = [
  'Below $500',
  '$500-$1000',
  '$1000-$5000',
  'Above $5000',
];

export const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
];

export const KANBAN_STATUSES = [...STATUS_OPTIONS];

export const LEGACY_STATUS_OPTIONS = ['Closed'];

export const SOURCE_OPTIONS = ['Website', 'LinkedIn', 'Instagram', 'Referral', 'Walk-in'];

export const CATEGORY_OPTIONS = ['Enterprise', 'SMB', 'Startup', 'Individual', 'Partner', 'Other'];

export const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export const USER_ROLES = {
  admin: 'Admin',
  manager: 'Manager',
  sales_executive: 'Sales Executive',
};

export const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  manager: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  sales_executive: 'bg-teal-100 text-teal-700 border-teal-200',
};

export const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-700 border-blue-200',
  Contacted: 'bg-amber-100 text-amber-700 border-amber-200',
  Qualified: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Proposal: 'bg-violet-100 text-violet-700 border-violet-200',
  Negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
  Won: 'bg-green-100 text-green-700 border-green-200',
  Lost: 'bg-red-100 text-red-700 border-red-200',
  Closed: 'bg-green-100 text-green-700 border-green-200',
};

export const SOURCE_COLORS = {
  Website: 'bg-slate-100 text-slate-700 border-slate-200',
  LinkedIn: 'bg-sky-100 text-sky-700 border-sky-200',
  Instagram: 'bg-pink-100 text-pink-700 border-pink-200',
  Referral: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Walk-in': 'bg-amber-100 text-amber-700 border-amber-200',
};

export const PRIORITY_COLORS = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const SENTIMENT_COLORS = {
  Positive: 'bg-green-100 text-green-700 border-green-200',
  Neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  Negative: 'bg-red-100 text-red-700 border-red-200',
};

export const normalizeStatus = (status) => (status === 'Closed' ? 'Won' : status);

export const getLeadScoreColor = (score) => {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatShortDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((e) => e.message).join(', ');
  }
  return error.response?.data?.message || error.message || 'Something went wrong';
};

export const canManageUsers = (role) => role === 'admin';
export const canDeleteLeads = (role) => ['admin', 'manager'].includes(role);

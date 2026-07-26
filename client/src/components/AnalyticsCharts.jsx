import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { StatCardSkeleton } from './ui/Skeleton';

const STATUS_PIE_COLORS = {
  New: '#3b82f6',
  Contacted: '#0284c7',
  Qualified: '#6366f1',
  Proposal: '#8b5cf6',
  Negotiation: '#f59e0b',
  Won: '#10b981',
  Lost: '#ef4444',
  Closed: '#64748b',
};

const SOURCE_COLORS = {
  Website: '#3b82f6',
  LinkedIn: '#0284c7',
  Instagram: '#ec4899',
  Referral: '#10b981',
  'Walk-in': '#f59e0b',
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        {label && <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-600 dark:text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {prefix}
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsCharts = ({ chartsData = {}, loading = false }) => {
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#1e293b' : '#f1f5f9';

  const monthlyLeads = useMemo(() => chartsData.monthlyLeads || [], [chartsData]);
  const statusDist = useMemo(() => chartsData.statusDistribution || [], [chartsData]);
  const sourceDist = useMemo(() => chartsData.sourceDistribution || [], [chartsData]);
  const priorityDist = useMemo(() => chartsData.priorityDistribution || [], [chartsData]);
  const revenueData = useMemo(() => chartsData.revenue || [], [chartsData]);
  const wonVsLostData = useMemo(() => chartsData.wonVsLost || [], [chartsData]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <StatCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Monthly Leads (Area Chart) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Leads Trend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Lead intake over recent months</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyLeads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" leads" />} />
              <Area type="monotone" dataKey="count" name="Leads" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Status Distribution (Donut Chart) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Status Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Leads categorized by status</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDist}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="name"
              >
                {statusDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_PIE_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip suffix=" leads" />} />
              <Legend formatter={(value) => <span style={{ color: textColor, fontSize: '12px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Lead Source Distribution (Bar Chart) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Lead Source Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Inquiries per acquisition channel</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="source" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" leads" />} />
              <Bar dataKey="count" name="Source Leads" radius={[8, 8, 0, 0]}>
                {sourceDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.source] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Priority Distribution (Bar Chart) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Priority Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">AI Priority score breakdown</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="priority" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" leads" />} />
              <Bar dataKey="count" name="Leads" radius={[8, 8, 0, 0]}>
                {priorityDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Revenue Pipeline (Bar Chart) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Pipeline</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Estimated value per pipeline stage</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="stage" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip prefix="$" />} />
              <Bar dataKey="value" name="Revenue Value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Won vs Lost Deals (Comparative Bar Chart) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Won vs Lost Deals</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monthly conversion comparisons</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wonVsLostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" deals" />} />
              <Legend formatter={(value) => <span style={{ color: textColor, fontSize: '12px' }}>{value}</span>} />
              <Bar dataKey="won" name="Won Deals" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="lost" name="Lost Deals" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;

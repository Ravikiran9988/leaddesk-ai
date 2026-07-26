import { useMemo } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  Flame,
  Trophy,
  XCircle,
  DollarSign,
  Percent,
} from 'lucide-react';
import { StatCardSkeleton } from './ui/Skeleton';

const DashboardCards = ({ stats = {}, loading = false }) => {
  const cards = useMemo(
    () => [
      {
        id: 'total',
        label: 'Total Leads',
        value: stats.totalLeads ?? stats.total ?? 0,
        icon: Users,
        gradient: 'from-blue-500 to-indigo-600',
        textAccent: 'text-indigo-600 dark:text-indigo-400',
        borderAccent: 'border-indigo-100 dark:border-indigo-900/40',
        bgSubtle: 'bg-indigo-50 dark:bg-indigo-950/40',
      },
      {
        id: 'today',
        label: "Today's Leads",
        value: stats.todayLeads ?? 0,
        icon: Calendar,
        gradient: 'from-cyan-500 to-blue-600',
        textAccent: 'text-blue-600 dark:text-blue-400',
        borderAccent: 'border-blue-100 dark:border-blue-900/40',
        bgSubtle: 'bg-blue-50 dark:bg-blue-950/40',
      },
      {
        id: 'monthly',
        label: 'Monthly Leads',
        value: stats.monthlyLeads ?? 0,
        icon: TrendingUp,
        gradient: 'from-purple-500 to-indigo-600',
        textAccent: 'text-purple-600 dark:text-purple-400',
        borderAccent: 'border-purple-100 dark:border-purple-900/40',
        bgSubtle: 'bg-purple-50 dark:bg-purple-950/40',
      },
      {
        id: 'priority',
        label: 'High Priority',
        value: stats.highPriority ?? 0,
        icon: Flame,
        gradient: 'from-amber-500 to-rose-600',
        textAccent: 'text-rose-600 dark:text-rose-400',
        borderAccent: 'border-rose-100 dark:border-rose-900/40',
        bgSubtle: 'bg-rose-50 dark:bg-rose-950/40',
      },
      {
        id: 'won',
        label: 'Won Deals',
        value: stats.wonDeals ?? stats.Won ?? 0,
        icon: Trophy,
        gradient: 'from-emerald-500 to-teal-600',
        textAccent: 'text-emerald-600 dark:text-emerald-400',
        borderAccent: 'border-emerald-100 dark:border-emerald-900/40',
        bgSubtle: 'bg-emerald-50 dark:bg-emerald-950/40',
      },
      {
        id: 'lost',
        label: 'Lost Deals',
        value: stats.lostDeals ?? stats.Lost ?? 0,
        icon: XCircle,
        gradient: 'from-rose-500 to-red-600',
        textAccent: 'text-red-600 dark:text-red-400',
        borderAccent: 'border-red-100 dark:border-red-900/40',
        bgSubtle: 'bg-red-50 dark:bg-red-950/40',
      },
      {
        id: 'revenue',
        label: 'Estimated Revenue',
        value: `$${(stats.estimatedRevenue ?? 0).toLocaleString()}`,
        icon: DollarSign,
        gradient: 'from-emerald-600 to-green-600',
        textAccent: 'text-emerald-600 dark:text-emerald-400',
        borderAccent: 'border-emerald-100 dark:border-emerald-900/40',
        bgSubtle: 'bg-emerald-50 dark:bg-emerald-950/40',
      },
      {
        id: 'conversion',
        label: 'Conversion Rate',
        value: `${stats.conversionRate ?? 0}%`,
        icon: Percent,
        gradient: 'from-violet-500 to-purple-600',
        textAccent: 'text-violet-600 dark:text-violet-400',
        borderAccent: 'border-violet-100 dark:border-violet-900/40',
        bgSubtle: 'bg-violet-50 dark:bg-violet-950/40',
      },
    ],
    [stats]
  );

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-slate-900 ${card.borderAccent}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <div className={`rounded-xl p-2.5 ${card.bgSubtle}`}>
                <Icon className={`h-5 w-5 ${card.textAccent}`} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {card.value}
              </span>
            </div>
            {/* Gradient accent line on bottom hover */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;

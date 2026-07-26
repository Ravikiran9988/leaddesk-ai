import { memo } from 'react';
import { Filter, X } from 'lucide-react';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import {
  STATUS_OPTIONS,
  SOURCE_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  BUDGET_OPTIONS,
} from '../utils/constants';

const LeadFilters = memo(({ filters, assignees = [], onChange, onReset }) => {
  const hasActiveFilters =
    filters.status ||
    filters.priority ||
    filters.category ||
    filters.source ||
    filters.assignedTo ||
    filters.budget ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Filter className="h-3.5 w-3.5 text-indigo-500" />
          Advanced Filters
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Select
          placeholder="All statuses"
          options={['', ...STATUS_OPTIONS]}
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value, page: 1 })}
        />
        <Select
          placeholder="All priorities"
          options={['', ...PRIORITY_OPTIONS]}
          value={filters.priority}
          onChange={(e) => onChange({ priority: e.target.value, page: 1 })}
        />
        <Select
          placeholder="All categories"
          options={['', ...CATEGORY_OPTIONS]}
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value, page: 1 })}
        />
        <Select
          placeholder="All sources"
          options={['', ...SOURCE_OPTIONS]}
          value={filters.source}
          onChange={(e) => onChange({ source: e.target.value, page: 1 })}
        />
        <select
          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          value={filters.assignedTo}
          onChange={(e) => onChange({ assignedTo: e.target.value, page: 1 })}
        >
          <option value="" className="dark:bg-slate-900 dark:text-white">All assignees</option>
          {assignees.map((user) => (
            <option key={user._id} value={user._id} className="dark:bg-slate-900 dark:text-white">
              {user.name}
            </option>
          ))}
        </select>
        <Select
          placeholder="All budgets"
          options={['', ...BUDGET_OPTIONS]}
          value={filters.budget}
          onChange={(e) => onChange({ budget: e.target.value, page: 1 })}
        />
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value, page: 1 })}
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value, page: 1 })}
        />
      </div>
    </div>
  );
});

export default LeadFilters;

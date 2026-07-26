import { useMemo, memo } from 'react';
import { KANBAN_STATUSES, STATUS_COLORS, normalizeStatus, formatShortDate } from '../utils/constants';

const KanbanBoard = memo(({ leads, onStatusChange, onSelectLead, updatingId }) => {
  const columns = useMemo(() => {
    const grouped = {};
    KANBAN_STATUSES.forEach((status) => {
      grouped[status] = [];
    });

    leads.forEach((lead) => {
      const status = normalizeStatus(lead.status);
      if (grouped[status]) {
        grouped[status].push(lead);
      }
    });

    return grouped;
  }, [leads]);

  const handleDrop = (e, status) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) onStatusChange(leadId, status);
  };

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none">
      {KANBAN_STATUSES.map((status) => (
        <div
          key={status}
          className="min-w-[260px] flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {status}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{columns[status].length}</span>
            </div>
          </div>

          <div className="space-y-3 p-3">
            {columns[status].map((lead) => (
              <div
                key={lead._id}
                draggable
                onDragStart={(e) => handleDragStart(e, lead._id)}
                onClick={() => onSelectLead(lead)}
                className={`cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500 ${
                  updatingId === lead._id ? 'opacity-50' : ''
                }`}
              >
                <p className="font-bold text-slate-900 dark:text-white">{lead.name}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {lead.source}
                  </span>
                  {lead.category && (
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {lead.category}
                    </span>
                  )}
                </div>
                {lead.assignedTo && (
                  <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Assigned: {lead.assignedTo.name}
                  </p>
                )}
                <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">{formatShortDate(lead.createdAt)}</p>
              </div>
            ))}
            {columns[status].length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Drop leads here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default KanbanBoard;

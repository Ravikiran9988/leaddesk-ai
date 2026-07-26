import { useMemo } from 'react';
import { KANBAN_STATUSES, STATUS_COLORS, normalizeStatus, formatShortDate } from '../utils/constants';

const KanbanBoard = ({ leads, onStatusChange, onSelectLead, updatingId }) => {
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_STATUSES.map((status) => (
        <div
          key={status}
          className="min-w-[260px] flex-1 rounded-2xl border border-slate-200 bg-slate-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status]}`}>
                {status}
              </span>
              <span className="text-xs font-medium text-slate-500">{columns[status].length}</span>
            </div>
          </div>

          <div className="space-y-3 p-3">
            {columns[status].map((lead) => (
              <div
                key={lead._id}
                draggable
                onDragStart={(e) => handleDragStart(e, lead._id)}
                onClick={() => onSelectLead(lead)}
                className={`cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-brand-300 hover:shadow-md ${
                  updatingId === lead._id ? 'opacity-60' : ''
                }`}
              >
                <p className="font-semibold text-slate-900">{lead.name}</p>
                <p className="mt-1 text-xs text-slate-500">{lead.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {lead.source}
                  </span>
                  {lead.category && (
                    <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                      {lead.category}
                    </span>
                  )}
                </div>
                {lead.assignedTo && (
                  <p className="mt-2 text-[11px] text-slate-400">Assigned: {lead.assignedTo.name}</p>
                )}
                <p className="mt-2 text-[10px] text-slate-400">{formatShortDate(lead.createdAt)}</p>
              </div>
            ))}
            {columns[status].length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">Drop leads here</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;

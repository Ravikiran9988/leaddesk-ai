import { useMemo, useState, useEffect } from 'react';
import { Search, Eye, Trash2, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeads } from '../hooks/useLeads';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/leadService';
import AdminLayout from '../components/AdminLayout';
import LeadFilters from '../components/LeadFilters';
import LeadDetailModal from '../components/LeadDetailModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import {
  STATUS_OPTIONS,
  STATUS_COLORS,
  SOURCE_COLORS,
  PRIORITY_COLORS,
  formatDate,
  getLeadScoreColor,
  canDeleteLeads,
  normalizeStatus,
  getErrorMessage,
} from '../utils/constants';
import { TableSkeleton, StatCardSkeleton } from '../components/ui/Skeleton';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const {
    leads,
    stats,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    updateLead,
    deleteLead,
    addNote,
    uploadFile,
    exportLeads,
    refetch,
  } = useLeads();

  const [selectedLead, setSelectedLead] = useState(null);
  const [deletingId, setDeletingId] = useState('');
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    userService.getAssignees().then(({ data }) => setAssignees(data.data)).catch(() => {});
  }, []);

  const statsCards = useMemo(
    () => [
      { label: 'Total Leads', value: stats.total, accent: 'text-brand-600' },
      { label: 'New', value: stats.New ?? stats.new ?? 0, accent: 'text-blue-600' },
      { label: 'In Pipeline', value: (stats.Contacted ?? 0) + (stats.Qualified ?? 0) + (stats.Proposal ?? 0) + (stats.Negotiation ?? 0), accent: 'text-amber-600' },
      { label: 'Won / Lost', value: (stats.Won ?? 0) + (stats.Lost ?? 0), accent: 'text-green-600' },
    ],
    [stats]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    updateFilters({ search: value, page: 1 });
  };

  const handleDelete = async (leadId) => {
    setDeletingId(leadId);
    try {
      await deleteLead(leadId);
      if (selectedLead?._id === leadId) setSelectedLead(null);
      toast.success('Lead deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId('');
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await exportLeads(format);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout title="CRM Dashboard" subtitle="Search, filter, manage, and export your leads">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          statsCards.map((card) => <StatCardSkeleton key={card.label} />)
        ) : (
          statsCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className={`mt-2 text-3xl font-bold ${card.accent}`}>{card.value}</p>
            </div>
          ))
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Lead Management</h2>
            <p className="text-sm text-slate-500">Advanced search, filters, and bulk export.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Search name, email, tags, source..."
                value={searchValue}
                onChange={handleSearch}
              />
            </div>
            <Select
              className="min-w-[160px]"
              placeholder="All statuses"
              options={['', ...STATUS_OPTIONS]}
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value, page: 1 })}
            />
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              Filters
            </Button>
            <Button variant="outline" loading={exporting} onClick={() => handleExport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" loading={exporting} onClick={() => handleExport('xlsx')}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4">
            <LeadFilters
              filters={filters}
              assignees={assignees}
              onChange={updateFilters}
              onReset={resetFilters}
            />
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={6} />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div>
          ) : leads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No leads found for the selected criteria.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Assigned</th>
                  <th className="px-4 py-3 font-medium">AI Score</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.email}</div>
                      {lead.tags?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {lead.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${SOURCE_COLORS[lead.source] || 'bg-slate-100 text-slate-700'}`}>
                        {lead.source || 'Website'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{lead.category || lead.aiAnalysis?.category || '—'}</td>
                    <td className="px-4 py-4 text-slate-600">{lead.assignedTo?.name || '—'}</td>
                    <td className="px-4 py-4">
                      {lead.aiAnalysis?.analyzedAt ? (
                        <span className={`font-bold ${getLeadScoreColor(lead.aiAnalysis.leadScore)}`}>
                          {lead.aiAnalysis.leadScore}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {lead.aiAnalysis?.analyzedAt ? (
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[lead.aiAnalysis.priority]}`}>
                          {lead.aiAnalysis.priority}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[normalizeStatus(lead.status)] || 'bg-slate-100 text-slate-700'}`}>
                        {normalizeStatus(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        {canDeleteLeads(user?.role) && (
                          <Button variant="danger" size="sm" loading={deletingId === lead._id} onClick={() => handleDelete(lead._id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} leads)
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => updateFilters({ page: pagination.page - 1 })}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => updateFilters({ page: pagination.page + 1 })}>
              Next
            </Button>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <LeadDetailModal
        lead={selectedLead}
        assignees={assignees}
        user={user}
        onClose={() => setSelectedLead(null)}
        onUpdate={updateLead}
        onDelete={deleteLead}
        onAddNote={addNote}
        onUpload={uploadFile}
        onRefetch={refetch}
      />
    </AdminLayout>
  );
};

export default AdminDashboardPage;

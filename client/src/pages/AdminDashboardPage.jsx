import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, RefreshCw, Download, BarChart2, Table as TableIcon, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeads } from '../hooks/useLeads';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { userService } from '../services/leadService';
import AdminLayout from '../components/AdminLayout';
import DashboardCards from '../components/DashboardCards';
import AnalyticsCharts from '../components/AnalyticsCharts';
import LeadFilters from '../components/LeadFilters';
import LeadDetailModal from '../components/LeadDetailModal';
import EmptyState from '../components/EmptyState';
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
import { TableSkeleton } from '../components/ui/Skeleton';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const {
    leads,
    analyticsData,
    analyticsLoading,
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'analytics' | 'leads'

  useEffect(() => {
    userService
      .getAssignees()
      .then(({ data }) => setAssignees(data.data))
      .catch(() => {});
  }, []);

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
    <AdminLayout
      title="Enterprise Analytics Dashboard"
      subtitle="Real-time KPI metrics, Recharts intelligence analytics, & lead pipeline management"
      onSelectLead={(lead) => setSelectedLead(lead)}
    >
      {/* Live Socket Status Indicator & Navigation Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
            }`}
          >
            <Radio className={`h-3.5 w-3.5 ${isConnected ? 'animate-pulse text-emerald-600' : ''}`} />
            {isConnected ? 'Real-Time Socket Live' : 'Connecting Real-Time...'}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'leads'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            Lead Directory ({pagination.total})
          </button>
        </div>
      </div>

      {/* 1. Dashboard Metric Cards (8 KPI Cards) */}
      <section className="mb-8">
        <DashboardCards stats={analyticsData.cards} loading={analyticsLoading} />
      </section>

      {/* 2. Recharts Interactive Charts Section */}
      {(activeTab === 'overview' || activeTab === 'analytics') && (
        <section className="mb-8 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Business Intelligence Visualizations</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Powered by Recharts</span>
          </div>
          <AnalyticsCharts chartsData={analyticsData.charts} loading={analyticsLoading} />
        </section>
      )}

      {/* 3. Lead Management & Table Directory */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-6 animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lead Management Directory</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Advanced search, multi-faceted filtering, and bulk CSV/Excel exports.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          ) : leads.length === 0 ? (
            <EmptyState
              title="No leads found"
              description="No lead records match your current search and filter criteria."
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              }
            />
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3.5 font-bold">Lead</th>
                  <th className="px-4 py-3.5 font-bold">Source</th>
                  <th className="px-4 py-3.5 font-bold">Category</th>
                  <th className="px-4 py-3.5 font-bold">Assigned</th>
                  <th className="px-4 py-3.5 font-bold">AI Score</th>
                  <th className="px-4 py-3.5 font-bold">Priority</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-4 py-3.5 font-bold">Date</th>
                  <th className="px-4 py-3.5 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/50 dark:bg-slate-900">
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{lead.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</div>
                      {lead.tags?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {lead.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          SOURCE_COLORS[lead.source] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {lead.source || 'Website'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      {lead.category || lead.aiAnalysis?.category || '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      {lead.assignedTo?.name || '—'}
                    </td>
                    <td className="px-4 py-4">
                      {lead.aiAnalysis?.analyzedAt ? (
                        <span className={`font-black ${getLeadScoreColor(lead.aiAnalysis.leadScore)}`}>
                          {lead.aiAnalysis.leadScore}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {lead.aiAnalysis?.analyzedAt ? (
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_COLORS[lead.aiAnalysis.priority]}`}
                        >
                          {lead.aiAnalysis.priority}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          STATUS_COLORS[normalizeStatus(lead.status)] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {normalizeStatus(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Button>
                        {canDeleteLeads(user?.role) && (
                          <Button
                            variant="danger"
                            size="sm"
                            loading={deletingId === lead._id}
                            onClick={() => handleDelete(lead._id)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} leads)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => updateFilters({ page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateFilters({ page: pagination.page + 1 })}
            >
              Next
            </Button>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
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

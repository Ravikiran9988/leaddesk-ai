import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, Eye, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../hooks/useLeads';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { STATUS_OPTIONS, STATUS_COLORS, formatDate } from '../utils/constants';
import { TableSkeleton, StatCardSkeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { leads, stats, pagination, loading, error, filters, updateFilters, updateLeadStatus, deleteLead, refetch } = useLeads();
  const [selectedLead, setSelectedLead] = useState(null);
  const [deletingId, setDeletingId] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState('');
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const statsCards = useMemo(
    () => [
      { label: 'Total Leads', value: stats.total, accent: 'text-brand-600' },
      { label: 'New', value: stats.new, accent: 'text-blue-600' },
      { label: 'Contacted', value: stats.contacted, accent: 'text-amber-600' },
      { label: 'Closed', value: stats.closed, accent: 'text-green-600' },
    ],
    [stats]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    updateFilters({ search: value, page: 1 });
  };

  const handleStatusFilter = (e) => {
    updateFilters({ status: e.target.value, page: 1 });
  };

  const handlePageChange = (nextPage) => {
    updateFilters({ page: nextPage });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleStatusUpdate = async (leadId, status) => {
    setStatusUpdatingId(leadId);
    try {
      await updateLeadStatus(leadId, status);
    } finally {
      setStatusUpdatingId('');
    }
  };

  const handleDelete = async (leadId) => {
    setDeletingId(leadId);
    try {
      await deleteLead(leadId);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Admin Dashboard</p>
            <h1 className="text-xl font-bold text-slate-900">Welcome back, {user?.name || 'Admin'}</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
              <p className="text-sm text-slate-500">Search, review, update, and remove leads.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-10"
                  placeholder="Search by name, email, or status"
                  value={searchValue}
                  onChange={handleSearch}
                />
              </div>
              <Select
                className="min-w-[180px]"
                placeholder="All statuses"
                options={['', ...STATUS_OPTIONS]}
                value={filters.status}
                onChange={handleStatusFilter}
              />
            </div>
          </div>

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
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
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
                        <div className="mt-1 text-xs text-slate-500">{lead.message}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{lead.email}</td>
                      <td className="px-4 py-4 text-slate-600">{lead.budget}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[lead.status] || 'bg-slate-100 text-slate-700'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="secondary" size="sm" loading={statusUpdatingId === lead._id} onClick={() => handleStatusUpdate(lead._id, lead.status === 'Closed' ? 'New' : 'Closed')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {lead.status === 'Closed' ? 'Reopen' : 'Close'}
                          </Button>
                          <Button variant="danger" size="sm" loading={deletingId === lead._id} onClick={() => handleDelete(lead._id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">Showing page {pagination.page} of {pagination.totalPages || 1}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>
                Next
              </Button>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Details">
        {selectedLead && (
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Name</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedLead.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</p>
              <p className="mt-1">{selectedLead.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Budget</p>
              <p className="mt-1">{selectedLead.budget}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Message</p>
              <p className="mt-1 leading-relaxed">{selectedLead.message}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p className="mt-1">{selectedLead.status}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;

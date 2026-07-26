import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import KanbanBoard from '../components/KanbanBoard';
import LeadFilters from '../components/LeadFilters';
import LeadDetailModal from '../components/LeadDetailModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { leadService, userService } from '../services/leadService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/constants';
import Spinner from '../components/ui/Spinner';

const KanbanPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    source: '',
    assignedTo: '',
    budget: '',
    dateFrom: '',
    dateTo: '',
  });

  const fetchKanbanLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await leadService.getAll({ ...filters, limit: 200, page: 1 });
      setLeads(data.data.leads);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchKanbanLeads();
  }, [fetchKanbanLeads]);

  useEffect(() => {
    userService.getAssignees().then(({ data }) => setAssignees(data.data)).catch(() => {});
  }, []);

  const handleStatusChange = async (leadId, status) => {
    setUpdatingId(leadId);
    try {
      const { data } = await leadService.update(leadId, { status });
      setLeads((prev) => prev.map((l) => (l._id === leadId ? data.data : l)));
      if (selectedLead?._id === leadId) setSelectedLead(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId('');
    }
  };

  const handleUpdate = async (id, payload) => {
    const { data } = await leadService.update(id, payload);
    setLeads((prev) => prev.map((l) => (l._id === id ? data.data : l)));
    await fetchKanbanLeads();
    return data.data;
  };

  const handleAddNote = async (id, content) => {
    const { data } = await leadService.addNote(id, content);
    setLeads((prev) => prev.map((l) => (l._id === id ? data.data : l)));
    return data.data;
  };

  const handleUpload = async (id, file) => {
    const { data } = await leadService.uploadFile(id, file);
    setLeads((prev) => prev.map((l) => (l._id === id ? data.data : l)));
    return data.data;
  };

  const handleDelete = async (id) => {
    await leadService.delete(id);
    setLeads((prev) => prev.filter((l) => l._id !== id));
    await fetchKanbanLeads();
  };

  return (
    <AdminLayout title="Kanban Board" subtitle="Drag and drop leads across pipeline stages">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-[240px] max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Search leads..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>
          <Button variant="secondary" onClick={fetchKanbanLeads}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4">
          <LeadFilters
            filters={filters}
            assignees={assignees}
            onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
            onReset={() =>
              setFilters({
                search: '',
                status: '',
                priority: '',
                category: '',
                source: '',
                assignedTo: '',
                budget: '',
                dateFrom: '',
                dateTo: '',
              })
            }
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <KanbanBoard
          leads={leads}
          onStatusChange={handleStatusChange}
          onSelectLead={setSelectedLead}
          updatingId={updatingId}
        />
      )}

      <LeadDetailModal
        lead={selectedLead}
        assignees={assignees}
        user={user}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
        onUpload={handleUpload}
        onRefetch={fetchKanbanLeads}
      />
    </AdminLayout>
  );
};

export default KanbanPage;

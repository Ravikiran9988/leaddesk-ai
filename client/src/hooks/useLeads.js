import { useState, useEffect, useCallback } from 'react';
import { leadService } from '../services/leadService';
import { getErrorMessage } from '../utils/constants';

export const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, closed: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await leadService.getAll(filters);
      setLeads(data.data.leads);
      setStats(data.data.stats);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  };

  const updateLeadStatus = async (id, status) => {
    const { data } = await leadService.update(id, { status });
    setLeads((prev) => prev.map((lead) => (lead._id === id ? data.data : lead)));
    await fetchLeads();
    return data;
  };

  const deleteLead = async (id) => {
    await leadService.delete(id);
    await fetchLeads();
  };

  return {
    leads,
    stats,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    updateLeadStatus,
    deleteLead,
    refetch: fetchLeads,
  };
};

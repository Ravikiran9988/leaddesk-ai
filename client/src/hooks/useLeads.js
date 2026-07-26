import { useState, useEffect, useCallback } from 'react';
import { leadService } from '../services/leadService';
import { getErrorMessage } from '../utils/constants';
import { useSocket } from '../context/SocketContext';

const defaultStats = {
  total: 0,
  New: 0,
  Contacted: 0,
  Qualified: 0,
  Proposal: 0,
  Negotiation: 0,
  Won: 0,
  Lost: 0,
  new: 0,
  contacted: 0,
  closed: 0,
};

const defaultAnalytics = {
  cards: {
    totalLeads: 0,
    todayLeads: 0,
    monthlyLeads: 0,
    highPriority: 0,
    wonDeals: 0,
    lostDeals: 0,
    estimatedRevenue: 0,
    conversionRate: 0,
  },
  charts: {
    monthlyLeads: [],
    statusDistribution: [],
    sourceDistribution: [],
    priorityDistribution: [],
    revenue: [],
    wonVsLost: [],
  },
};

export const useLeads = () => {
  const { socket } = useSocket();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [analyticsData, setAnalyticsData] = useState(defaultAnalytics);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await leadService.getAnalytics();
      setAnalyticsData(data.data);
    } catch (err) {
      console.warn('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real-time socket event listeners to keep counters & dashboard fresh
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      fetchLeads();
      fetchAnalytics();
    };

    socket.on('lead:created', handleRealtimeUpdate);
    socket.on('lead:updated', handleRealtimeUpdate);
    socket.on('lead:assigned', handleRealtimeUpdate);
    socket.on('dashboard:counters', handleRealtimeUpdate);
    socket.on('ai:analyzed', handleRealtimeUpdate);

    return () => {
      socket.off('lead:created', handleRealtimeUpdate);
      socket.off('lead:updated', handleRealtimeUpdate);
      socket.off('lead:assigned', handleRealtimeUpdate);
      socket.off('dashboard:counters', handleRealtimeUpdate);
      socket.off('ai:analyzed', handleRealtimeUpdate);
    };
  }, [socket, fetchLeads, fetchAnalytics]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  };

  const resetFilters = () => {
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
      page: 1,
      limit: filters.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const updateLead = async (id, payload) => {
    const { data } = await leadService.update(id, payload);
    setLeads((prev) => prev.map((lead) => (lead._id === id ? data.data : lead)));
    await fetchLeads();
    await fetchAnalytics();
    return data.data;
  };

  const updateLeadStatus = async (id, status) => updateLead(id, { status });

  const deleteLead = async (id) => {
    await leadService.delete(id);
    await fetchLeads();
    await fetchAnalytics();
  };

  const addNote = async (id, content) => {
    const { data } = await leadService.addNote(id, content);
    setLeads((prev) => prev.map((lead) => (lead._id === id ? data.data : lead)));
    return data.data;
  };

  const uploadFile = async (id, file) => {
    const { data } = await leadService.uploadFile(id, file);
    setLeads((prev) => prev.map((lead) => (lead._id === id ? data.data : lead)));
    return data.data;
  };

  const exportLeads = async (format = 'csv') => {
    const response = await leadService.export(filters, format);
    const blob = new Blob([response.data], {
      type:
        format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    leads,
    stats,
    analyticsData,
    analyticsLoading,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    updateLead,
    updateLeadStatus,
    deleteLead,
    addNote,
    uploadFile,
    exportLeads,
    refetch: () => {
      fetchLeads();
      fetchAnalytics();
    },
  };
};

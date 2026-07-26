import Lead, { LEAD_SOURCES } from '../models/Lead.js';
import User from '../models/User.js';
import {
  addActivity,
  buildLeadQuery,
  buildStatusStats,
  canAccessLead,
  canDeleteLead,
  KANBAN_STATUSES,
  normalizeStatus,
} from '../utils/leadHelpers.js';
import * as XLSX from 'xlsx';
import { emitSocketEvent } from '../utils/socket.js';
import {
  sendCustomerConfirmation,
  sendAdminNotification,
  sendAssignmentNotification,
} from '../services/emailService.js';

const populateLead = (query) =>
  query
    .populate('assignedTo', 'name email role')
    .populate('notes.createdBy', 'name email')
    .populate('activities.user', 'name email')
    .populate('attachments.uploadedBy', 'name email');

export const createLead = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      source: req.body.source || 'Website',
    };

    const lead = await Lead.create(payload);

    lead.activities.push({
      type: 'created',
      description: `Lead created from ${lead.source}`,
      metadata: { source: lead.source },
    });
    await lead.save();

    const populatedLead = await populateLead(Lead.findById(lead._id));

    // Emit Real-Time Socket Event
    emitSocketEvent('lead:created', populatedLead);
    emitSocketEvent('dashboard:counters', { action: 'lead_created' });

    // Send Async Emails
    sendCustomerConfirmation(populatedLead);
    sendAdminNotification(populatedLead);

    res.status(201).json({
      success: true,
      message: 'Lead submitted successfully. We will contact you soon!',
      data: populatedLead,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = buildLeadQuery(req);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const allowedSortFields = [
      'name',
      'email',
      'budget',
      'status',
      'source',
      'category',
      'createdAt',
      'aiAnalysis.leadScore',
      'aiAnalysis.priority',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [leads, total, stats] = await Promise.all([
      populateLead(Lead.find(query))
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(query),
      Lead.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statusCounts = buildStatusStats(stats);

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
        stats: {
          total,
          ...statusCounts,
          new: statusCounts.New,
          contacted: statusCounts.Contacted,
          closed: statusCounts.Won + statusCounts.Lost,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLeads,
      todayLeads,
      monthlyLeads,
      highPriority,
      wonDeals,
      lostDeals,
      statusStats,
      sourceStats,
      priorityStats,
      allLeadsForRevenue,
      monthlyTimeline,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: startOfToday } }),
      Lead.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Lead.countDocuments({ 'aiAnalysis.priority': 'High' }),
      Lead.countDocuments({ status: 'Won' }),
      Lead.countDocuments({ status: 'Lost' }),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$aiAnalysis.priority', count: { $sum: 1 } } }]),
      Lead.find({}, 'status budget aiAnalysis.estimatedDealValue'),
      Lead.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const budgetMap = {
      'Below $500': 350,
      '$500-$1000': 750,
      '$1000-$5000': 3000,
      'Above $5000': 7500,
    };

    let estimatedRevenue = 0;
    allLeadsForRevenue.forEach((l) => {
      if (l.aiAnalysis?.estimatedDealValue && l.aiAnalysis.estimatedDealValue > 0) {
        estimatedRevenue += l.aiAnalysis.estimatedDealValue;
      } else if (l.budget && budgetMap[l.budget]) {
        estimatedRevenue += budgetMap[l.budget];
      }
    });

    const closedDeals = wonDeals + lostDeals;
    const conversionRate =
      closedDeals > 0
        ? parseFloat(((wonDeals / closedDeals) * 100).toFixed(1))
        : totalLeads > 0
        ? parseFloat(((wonDeals / totalLeads) * 100).toFixed(1))
        : 0;

    const statusCounts = buildStatusStats(statusStats);
    const statusDistribution = Object.keys(statusCounts).map((status) => ({
      name: status,
      count: statusCounts[status] || 0,
    }));

    const sourceDistribution = (LEAD_SOURCES || ['Website', 'LinkedIn', 'Instagram', 'Referral', 'Walk-in']).map(
      (src) => {
        const found = sourceStats.find((s) => s._id === src);
        return { source: src, count: found ? found.count : 0 };
      }
    );

    const priorityDistribution = ['High', 'Medium', 'Low'].map((p) => {
      const found = priorityStats.find((s) => s._id === p);
      return { priority: p, count: found ? found.count : 0 };
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = `${monthNames[d.getMonth()]} ${
        d.getFullYear() !== now.getFullYear() ? d.getFullYear().toString().slice(2) : ''
      }`.trim();
      monthlyMap[key] = { month: label, count: 0, won: 0, lost: 0 };
    }

    monthlyTimeline.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (monthlyMap[key]) {
        monthlyMap[key].count += item.count;
        if (item._id.status === 'Won') monthlyMap[key].won += item.count;
        if (item._id.status === 'Lost') monthlyMap[key].lost += item.count;
      }
    });

    const monthlyLeadsData = Object.values(monthlyMap);
    const wonVsLostData = Object.values(monthlyMap).map((m) => ({
      month: m.month,
      won: m.won,
      lost: m.lost,
    }));

    const revenueByStageMap = {};
    allLeadsForRevenue.forEach((l) => {
      const st = normalizeStatus(l.status);
      const val = l.aiAnalysis?.estimatedDealValue || budgetMap[l.budget] || 500;
      revenueByStageMap[st] = (revenueByStageMap[st] || 0) + val;
    });

    const revenueData = Object.keys(revenueByStageMap).map((stage) => ({
      stage,
      value: revenueByStageMap[stage],
    }));

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalLeads,
          todayLeads,
          monthlyLeads,
          highPriority,
          wonDeals,
          lostDeals,
          estimatedRevenue,
          conversionRate,
        },
        charts: {
          monthlyLeads: monthlyLeadsData,
          statusDistribution,
          sourceDistribution,
          priorityDistribution,
          revenue: revenueData,
          wonVsLost: wonVsLostData,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await populateLead(Lead.findById(req.params.id));

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ success: false, message: 'Access denied to this lead' });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ success: false, message: 'Access denied to this lead' });
    }

    const updates = { ...req.body };

    if (updates.assignedTo === '') {
      updates.assignedTo = null;
    }
    const activities = [];
    let isStatusChanged = false;
    let isAssignmentChanged = false;

    if (updates.status && updates.status !== lead.status) {
      isStatusChanged = true;
      activities.push({
        type: 'status_changed',
        description: `Status changed from ${normalizeStatus(lead.status)} to ${normalizeStatus(updates.status)}`,
        user: req.user._id,
        metadata: { from: lead.status, to: updates.status },
      });
    }

    if (updates.assignedTo !== undefined && updates.assignedTo?.toString() !== lead.assignedTo?.toString()) {
      isAssignmentChanged = true;
      activities.push({
        type: 'assigned',
        description: updates.assignedTo ? 'Lead assigned to a team member' : 'Lead unassigned',
        user: req.user._id,
        metadata: { assignedTo: updates.assignedTo || null },
      });
    }

    if (updates.category !== undefined && updates.category !== lead.category) {
      activities.push({
        type: 'category_changed',
        description: `Category set to "${updates.category || 'None'}"`,
        user: req.user._id,
        metadata: { category: updates.category },
      });
    }

    if (updates.tags) {
      const oldTags = new Set(lead.tags || []);
      const newTags = new Set(updates.tags || []);
      [...newTags].filter((t) => !oldTags.has(t)).forEach((tag) => {
        activities.push({
          type: 'tag_added',
          description: `Tag "${tag}" added`,
          user: req.user._id,
          metadata: { tag },
        });
      });
      [...oldTags].filter((t) => !newTags.has(t)).forEach((tag) => {
        activities.push({
          type: 'tag_removed',
          description: `Tag "${tag}" removed`,
          user: req.user._id,
          metadata: { tag },
        });
      });
    }

    Object.assign(lead, updates);
    activities.forEach((activity) => addActivity(lead, activity));
    await lead.save();

    const populated = await populateLead(Lead.findById(lead._id));

    // Real-Time Socket Events & Notifications
    if (isStatusChanged) {
      emitSocketEvent('lead:updated', {
        type: 'status_changed',
        lead: populated,
        oldStatus: lead.status,
        newStatus: updates.status,
      });
    }

    if (isAssignmentChanged) {
      emitSocketEvent('lead:assigned', {
        type: 'assigned',
        lead: populated,
        assignedTo: populated.assignedTo,
      });

      if (populated.assignedTo) {
        sendAssignmentNotification(populated, populated.assignedTo);
      }
    }

    emitSocketEvent('dashboard:counters', { action: 'lead_updated' });

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    if (!canDeleteLead(req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied. Manager or Admin only.' });
    }

    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    emitSocketEvent('dashboard:counters', { action: 'lead_deleted' });

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addLeadNote = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ success: false, message: 'Access denied to this lead' });
    }

    const { content } = req.body;

    lead.notes.unshift({
      content,
      createdBy: req.user._id,
    });

    addActivity(lead, {
      type: 'note_added',
      description: 'Internal note added',
      user: req.user,
      metadata: { preview: content.slice(0, 80) },
    });

    await lead.save();

    const populated = await populateLead(Lead.findById(lead._id));

    emitSocketEvent('lead:note_added', {
      type: 'note_added',
      lead: populated,
      note: populated.notes[0],
    });

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const exportLeads = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;
    const query = buildLeadQuery(req);

    const leads = await populateLead(Lead.find(query).sort({ createdAt: -1 }).limit(5000));

    const rows = leads.map((lead) => ({
      Name: lead.name,
      Email: lead.email,
      Budget: lead.budget,
      Status: normalizeStatus(lead.status),
      Source: lead.source,
      Category: lead.category || lead.aiAnalysis?.category || '',
      Tags: (lead.tags || []).join(', '),
      Priority: lead.aiAnalysis?.priority || '',
      'Lead Score': lead.aiAnalysis?.leadScore || '',
      'Assigned To': lead.assignedTo?.name || '',
      Message: lead.message,
      Created: new Date(lead.createdAt).toISOString(),
    }));

    const defaultHeaders = [
      'Name',
      'Email',
      'Budget',
      'Status',
      'Source',
      'Category',
      'Tags',
      'Priority',
      'Lead Score',
      'Assigned To',
      'Message',
      'Created',
    ];

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=leads-export.xlsx');
      return res.send(buffer);
    }

    const headers = rows.length ? Object.keys(rows[0]) : defaultHeaders;
    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = String(row[h] ?? '').replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(',')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
    res.send(csvLines.join('\n'));
  } catch (error) {
    next(error);
  }
};

export const uploadLeadFile = async (req, res, next) => {
  try {
    const { cloudinary, isConfigured } = await import('../config/cloudinary.js');

    if (!isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'File upload is not configured. Set Cloudinary environment variables.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ success: false, message: 'Access denied to this lead' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'leaddesk',
          resource_type: 'auto',
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      stream.end(req.file.buffer);
    });

    lead.attachments.unshift({
      filename: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
    });

    addActivity(lead, {
      type: 'file_uploaded',
      description: `File "${req.file.originalname}" uploaded`,
      user: req.user,
      metadata: { filename: req.file.originalname, url: result.secure_url },
    });

    await lead.save();

    const populated = await populateLead(Lead.findById(lead._id));

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export { KANBAN_STATUSES };

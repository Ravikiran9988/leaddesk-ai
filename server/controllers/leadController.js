import Lead from '../models/Lead.js';
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

    res.status(201).json({
      success: true,
      message: 'Lead submitted successfully. We will contact you soon!',
      data: lead,
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

    if (updates.status && updates.status !== lead.status) {
      activities.push({
        type: 'status_changed',
        description: `Status changed from ${normalizeStatus(lead.status)} to ${normalizeStatus(updates.status)}`,
        user: req.user._id,
        metadata: { from: lead.status, to: updates.status },
      });
    }

    if (updates.assignedTo !== undefined && updates.assignedTo?.toString() !== lead.assignedTo?.toString()) {
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

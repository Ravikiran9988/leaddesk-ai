import Lead from '../models/Lead.js';
import {
  analyzeLead,
  generateFollowUpEmail,
  chatWithAssistant,
  isAiConfigured,
} from '../services/aiService.js';
import { canAccessLead, addActivity } from '../utils/leadHelpers.js';
import { emitSocketEvent } from '../utils/socket.js';
import { sendAdminNotification } from '../services/emailService.js';

export const getAiStatus = (req, res) => {
  res.status(200).json({
    success: true,
    data: { configured: isAiConfigured() },
  });
};

export const analyzeLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ success: false, message: 'Access denied to this lead' });
    }

    const analysis = await analyzeLead(lead);
    lead.aiAnalysis = analysis;
    addActivity(lead, {
      type: 'updated',
      description: 'AI analysis completed',
      user: req.user,
      metadata: { leadScore: analysis.leadScore, priority: analysis.priority },
    });
    await lead.save();

    // Emit Real-Time Event & Notifications
    emitSocketEvent('ai:analyzed', {
      type: 'ai_analysis_complete',
      lead,
      analysis,
    });
    emitSocketEvent('dashboard:counters', { action: 'ai_analyzed' });

    if (analysis.priority === 'High') {
      sendAdminNotification(lead);
    }

    res.status(200).json({
      success: true,
      message: 'Lead analyzed successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const generateLeadFollowUpEmail = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ success: false, message: 'Access denied to this lead' });
    }

    const email = await generateFollowUpEmail(lead, lead.aiAnalysis);
    lead.followUpEmail = email;
    addActivity(lead, {
      type: 'updated',
      description: 'Follow-up email generated',
      user: req.user,
    });
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Follow-up email generated successfully',
      data: { email, lead },
    });
  } catch (error) {
    next(error);
  }
};

export const assistantChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const query =
      req.user.role === 'sales_executive'
        ? { assignedTo: req.user._id }
        : {};

    const leads = await Lead.find(query).sort({ createdAt: -1 }).limit(100);
    const response = await chatWithAssistant(message.trim(), leads);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

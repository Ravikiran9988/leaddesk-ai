import express from 'express';
import {
  getAiStatus,
  analyzeLeadById,
  generateLeadFollowUpEmail,
  assistantChat,
} from '../controllers/aiController.js';
import { protect, crmAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', protect, crmAccess, getAiStatus);
router.post('/leads/:id/analyze', protect, crmAccess, analyzeLeadById);
router.post('/leads/:id/follow-up-email', protect, crmAccess, generateLeadFollowUpEmail);
router.post('/chat', protect, crmAccess, assistantChat);

export default router;

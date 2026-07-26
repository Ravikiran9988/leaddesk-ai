import express from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addLeadNote,
  exportLeads,
  uploadLeadFile,
  getLeadAnalytics,
} from '../controllers/leadController.js';
import {
  createLeadValidation,
  updateLeadValidation,
  addNoteValidation,
} from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, crmAccess } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', createLeadValidation, validate, createLead);
router.get('/export', protect, crmAccess, exportLeads);
router.get('/analytics', protect, crmAccess, getLeadAnalytics);
router.get('/', protect, crmAccess, getLeads);
router.get('/:id', protect, crmAccess, getLeadById);
router.patch('/:id', protect, crmAccess, updateLeadValidation, validate, updateLead);
router.delete('/:id', protect, crmAccess, deleteLead);
router.post('/:id/notes', protect, crmAccess, addNoteValidation, validate, addLeadNote);
router.post('/:id/upload', protect, crmAccess, upload.single('file'), uploadLeadFile);

export default router;

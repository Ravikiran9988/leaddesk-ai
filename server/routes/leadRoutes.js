import express from 'express';
import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
} from '../controllers/leadController.js';
import {
  createLeadValidation,
  updateLeadValidation,
} from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createLeadValidation, validate, createLead);
router.get('/', protect, adminOnly, getLeads);
router.patch('/:id', protect, adminOnly, updateLeadValidation, validate, updateLead);
router.delete('/:id', protect, adminOnly, deleteLead);

export default router;

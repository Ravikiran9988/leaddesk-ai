import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getAssignees,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly, crmAccess } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { USER_ROLES } from '../models/User.js';

const router = express.Router();

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(USER_ROLES)
    .withMessage('Invalid role'),
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(USER_ROLES)
    .withMessage('Invalid role'),
];

router.get('/assignees', protect, crmAccess, getAssignees);
router.get('/', protect, adminOnly, getUsers);
router.post('/', protect, adminOnly, createUserValidation, validate, createUser);
router.patch('/:id', protect, adminOnly, updateUserValidation, validate, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;

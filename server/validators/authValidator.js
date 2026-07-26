import { body } from 'express-validator';
import { LEAD_STATUSES, LEAD_SOURCES } from '../models/Lead.js';

export const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .matches(strongPasswordRegex)
    .withMessage(
      'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)'
    ),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'sales_executive'])
    .withMessage('Invalid role specified'),
];

export const createLeadValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('budget')
    .notEmpty()
    .withMessage('Budget is required')
    .isIn(['Below $500', '$500-$1000', '$1000-$5000', 'Above $5000'])
    .withMessage('Invalid budget selection'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters'),
  body('source')
    .optional()
    .isIn(LEAD_SOURCES)
    .withMessage('Invalid lead source'),
];

export const updateLeadValidation = [
  body('status')
    .optional()
    .isIn(LEAD_STATUSES)
    .withMessage('Invalid status value'),
  body('source')
    .optional()
    .isIn(LEAD_SOURCES)
    .withMessage('Invalid lead source'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category is too long'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('assignedTo')
    .optional({ nullable: true })
    .custom((value) => value === null || value === '' || /^[a-f\d]{24}$/i.test(value))
    .withMessage('Invalid assignee ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('budget')
    .optional()
    .isIn(['Below $500', '$500-$1000', '$1000-$5000', 'Above $5000'])
    .withMessage('Invalid budget selection'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters'),
];

export const addNoteValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Note must be between 2 and 2000 characters'),
];

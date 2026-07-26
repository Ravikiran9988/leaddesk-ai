import { body } from 'express-validator';
import { LEAD_STATUSES, LEAD_SOURCES } from '../models/Lead.js';

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const createLeadValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('budget')
    .notEmpty()
    .withMessage('Budget is required')
    .isIn(['Below $500', '$500-$1000', '$1000-$5000', 'Above $5000'])
    .withMessage('Invalid budget selection'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters'),
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
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('budget')
    .optional()
    .isIn(['Below $500', '$500-$1000', '$1000-$5000', 'Above $5000'])
    .withMessage('Invalid budget selection'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters'),
];

export const addNoteValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Note must be between 2 and 2000 characters'),
];

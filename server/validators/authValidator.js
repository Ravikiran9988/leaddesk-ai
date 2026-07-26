import { body } from 'express-validator';

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
];

export const updateLeadValidation = [
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Closed'])
    .withMessage('Invalid status value'),
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

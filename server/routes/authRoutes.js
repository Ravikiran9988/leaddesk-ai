import express from 'express';
import { login, logout, getMe, refreshAccessToken } from '../controllers/authController.js';
import { loginValidation } from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { strictAuthRateLimiter } from '../middleware/rateLimiterMiddleware.js';

const router = express.Router();

router.post('/login', strictAuthRateLimiter, loginValidation, validate, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;

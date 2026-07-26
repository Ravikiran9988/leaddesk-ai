import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { loginValidation } from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginValidation, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;

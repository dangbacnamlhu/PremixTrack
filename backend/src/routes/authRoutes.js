import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.post('/register', authenticate, authorize('admin'), authController.register);

export default router;

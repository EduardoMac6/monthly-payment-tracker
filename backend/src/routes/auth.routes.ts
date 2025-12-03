/**
 * Auth Routes
 * API routes for authentication
 */

import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

// Routes
router.post(
    '/register',
    validateBody(registerSchema),
    authController.register.bind(authController)
);

router.post(
    '/login',
    validateBody(loginSchema),
    authController.login.bind(authController)
);

export default router;


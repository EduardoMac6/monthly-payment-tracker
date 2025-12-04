/**
 * Auth Routes
 * API routes for authentication
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema, googleAuthSchema } from '../schemas/auth.schemas.js';

const router = Router();

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

router.post(
    '/google',
    validateBody(googleAuthSchema),
    authController.googleAuth.bind(authController)
);

export default router;


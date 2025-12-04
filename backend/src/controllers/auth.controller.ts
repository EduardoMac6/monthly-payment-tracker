/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

import { Request, Response, NextFunction } from 'express';
import { authService, RegisterInput, LoginInput, GoogleAuthInput } from '../services/auth.service.js';

export class AuthController {
    /**
     * Register new user
     * POST /api/auth/register
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as RegisterInput;
            const result = await authService.register(data);
            res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as LoginInput;
            const result = await authService.login(data);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Authenticate with Google
     * POST /api/auth/google
     */
    async googleAuth(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as GoogleAuthInput;
            const result = await authService.authenticateWithGoogle(data);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();


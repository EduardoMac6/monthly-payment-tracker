/**
 * Authentication Middleware
 * Verifies JWT tokens and extracts user information
 */

import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { AppError } from './error.middleware.js';
import { AuthRequest } from '../controllers/plans.controller.js';

/**
 * Authenticate request using JWT token
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const payload = authService.verifyToken(token);

        // Add userId to request
        req.userId = payload.userId;

        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Authentication failed', 401));
        }
    }
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = authService.verifyToken(token);
            req.userId = payload.userId;
        }

        next();
    } catch {
        // If token is invalid, just continue without userId
        next();
    }
}


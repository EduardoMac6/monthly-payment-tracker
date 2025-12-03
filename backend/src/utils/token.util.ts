/**
 * Token Utilities
 * JWT token generation and verification functions
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { TokenPayload } from '../types/auth.types.js';
import { AppError } from '../errors/app.error.js';

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload {
    try {
        return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
        throw new AppError('Invalid or expired token', 401);
    }
}


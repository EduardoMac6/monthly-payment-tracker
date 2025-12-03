/**
 * Express Type Extensions
 * Extends Express Request type to include authenticated user information
 */

import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export interface AuthRequest extends Request {
    userId: string;
}


/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handling middleware
 */
export function errorHandler(
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            res.status(409).json({
                success: false,
                error: 'Duplicate entry',
                message: 'A record with this value already exists',
            });
            return;
        }
        if (err.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Not found',
                message: 'Record not found',
            });
            return;
        }
    }

    // Validation errors
    if (err.name === 'ZodError') {
        res.status(400).json({
            success: false,
            error: 'Validation error',
            message: err.message,
        });
        return;
    }

    // Custom AppError
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            message: err.message,
        });
        return;
    }

    // Default error
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(_req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'The requested resource was not found',
    });
}


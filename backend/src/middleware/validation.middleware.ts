/**
 * Validation Middleware
 * Uses Zod for request validation
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validate request body with Zod schema
 */
export function validateBody(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
                return;
            }
            next(error);
        }
    };
}

/**
 * Validate request params with Zod schema
 */
export function validateParams(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.params = schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    message: 'Invalid request parameters',
                });
                return;
            }
            next(error);
        }
    };
}

/**
 * Validate request query with Zod schema
 */
export function validateQuery(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.query = schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    message: 'Invalid query parameters',
                });
                return;
            }
            next(error);
        }
    };
}


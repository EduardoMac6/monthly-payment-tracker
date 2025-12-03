/**
 * Auth Service
 * Business logic for authentication
 */

import { prisma } from '../config/database.js';
import { AppError } from '../errors/app.error.js';
import { RegisterInput, LoginInput, TokenPayload } from '../types/auth.types.js';
import { hashPassword, comparePassword } from '../utils/hash.util.js';
import { generateToken, verifyToken as verifyJwtToken } from '../utils/token.util.js';

export class AuthService {
    /**
     * Verify JWT token
     */
    verifyToken(token: string): TokenPayload {
        return verifyJwtToken(token);
    }

    /**
     * Register new user
     */
    async register(data: RegisterInput) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError('User with this email already exists', 409);
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        return {
            user,
            token,
        };
    }

    /**
     * Login user
     */
    async login(data: LoginInput) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // Verify password
        const isValidPassword = await comparePassword(data.password, user.password);

        if (!isValidPassword) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            },
            token,
        };
    }
}

export const authService = new AuthService();

// Re-export types for convenience
export type { RegisterInput, LoginInput, TokenPayload };


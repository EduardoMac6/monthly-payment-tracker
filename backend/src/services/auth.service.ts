/**
 * Auth Service
 * Business logic for authentication
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';

export interface RegisterInput {
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface TokenPayload {
    userId: string;
    email: string;
}

export class AuthService {
    /**
     * Hash password
     */
    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    /**
     * Compare password with hash
     */
    private async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Generate JWT token
     */
    private generateToken(payload: TokenPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        });
    }

    /**
     * Verify JWT token
     */
    verifyToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
        } catch (error) {
            throw new AppError('Invalid or expired token', 401);
        }
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
        const hashedPassword = await this.hashPassword(data.password);

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
        const token = this.generateToken({
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
        const isValidPassword = await this.comparePassword(data.password, user.password);

        if (!isValidPassword) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate token
        const token = this.generateToken({
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


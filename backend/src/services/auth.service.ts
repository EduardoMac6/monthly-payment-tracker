/**
 * Auth Service
 * Business logic for authentication
 */

import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database.js';
import { AppError } from '../errors/app.error.js';
import { RegisterInput, LoginInput, TokenPayload, GoogleAuthInput } from '../types/auth.types.js';
import { hashPassword, comparePassword } from '../utils/hash.util.js';
import { generateToken, verifyToken as verifyJwtToken } from '../utils/token.util.js';
import { env } from '../config/env.js';

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

        // Check if user has a password (OAuth users don't have passwords)
        if (!user.password) {
            throw new AppError('This account uses Google sign-in. Please sign in with Google instead.', 401);
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

    /**
     * Authenticate user with Google OAuth
     */
    async authenticateWithGoogle(data: GoogleAuthInput) {
        if (!env.GOOGLE_CLIENT_ID) {
            throw new AppError('Google OAuth is not configured', 500);
        }

        const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

        try {
            // Verify the Google ID token
            const ticket = await client.verifyIdToken({
                idToken: data.credential,
                audience: env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new AppError('Invalid Google token', 401);
            }

            const { sub: googleId, email, email_verified } = payload;

            if (!email || !email_verified) {
                throw new AppError('Email not verified by Google', 401);
            }

            // Find existing user by googleId or email
            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { googleId },
                        { email },
                    ],
                },
            });

            if (user) {
                // Update user if they logged in with email before and now using Google
                if (!user.googleId && googleId) {
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { googleId },
                        select: {
                            id: true,
                            email: true,
                            createdAt: true,
                        },
                    });
                }
            } else {
                // Create new user with Google OAuth
                user = await prisma.user.create({
                    data: {
                        email,
                        googleId,
                        password: null, // No password for OAuth users
                    },
                    select: {
                        id: true,
                        email: true,
                        createdAt: true,
                    },
                });
            }

            // Generate token
            const token = generateToken({
                userId: user.id,
                email: user.email,
            });

            return {
                user,
                token,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Failed to authenticate with Google', 401);
        }
    }
}

export const authService = new AuthService();

// Re-export types for convenience
export type { RegisterInput, LoginInput, TokenPayload, GoogleAuthInput };


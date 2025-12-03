/**
 * Auth Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/services/auth.service.js';
import { prisma } from '../../src/config/database.js';
import { AppError } from '../../src/errors/app.error.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Prisma
vi.mock('../../src/config/database.js', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

// Mock jwt
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
        verify: vi.fn(),
    },
}));

// Mock env
vi.mock('../../src/config/env.js', () => ({
    env: {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '7d',
    },
}));

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        service = new AuthService();
        vi.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
            };

            const hashedPassword = 'hashed-password';
            const mockUser = {
                id: 'user-123',
                email: userData.email,
                createdAt: new Date(),
            };

            const mockToken = 'jwt-token';

            (prisma.user.findUnique as any).mockResolvedValue(null);
            (bcrypt.hash as any).mockResolvedValue(hashedPassword);
            (prisma.user.create as any).mockResolvedValue({
                ...mockUser,
                password: hashedPassword,
            });
            (jwt.sign as any).mockReturnValue(mockToken);

            const result = await service.register(userData);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: userData.email },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(prisma.user.create).toHaveBeenCalled();
            expect(result.user.email).toBe(userData.email);
            expect(result.token).toBe(mockToken);
        });

        it('should throw error if user already exists', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
            };

            (prisma.user.findUnique as any).mockResolvedValue({
                id: 'user-123',
                email: userData.email,
            });

            await expect(service.register(userData)).rejects.toThrow(AppError);
            await expect(service.register(userData)).rejects.toThrow('already exists');
        });
    });

    describe('login', () => {
        it('should login user with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
            };

            const hashedPassword = 'hashed-password';
            const mockUser = {
                id: 'user-123',
                email: loginData.email,
                password: hashedPassword,
                createdAt: new Date(),
            };

            const mockToken = 'jwt-token';

            (prisma.user.findUnique as any).mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(true);
            (jwt.sign as any).mockReturnValue(mockToken);

            const result = await service.login(loginData);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: loginData.email },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, hashedPassword);
            expect(result.user.email).toBe(loginData.email);
            expect(result.token).toBe(mockToken);
        });

        it('should throw error if user not found', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
            };

            (prisma.user.findUnique as any).mockResolvedValue(null);

            await expect(service.login(loginData)).rejects.toThrow(AppError);
            await expect(service.login(loginData)).rejects.toThrow('Invalid email or password');
        });

        it('should throw error if password is incorrect', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrong-password',
            };

            const mockUser = {
                id: 'user-123',
                email: loginData.email,
                password: 'hashed-password',
            };

            (prisma.user.findUnique as any).mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(false);

            await expect(service.login(loginData)).rejects.toThrow(AppError);
            await expect(service.login(loginData)).rejects.toThrow('Invalid email or password');
        });
    });

    describe('verifyToken', () => {
        it('should verify valid token', () => {
            const payload = { userId: 'user-123', email: 'test@example.com' };
            (jwt.verify as any).mockReturnValue(payload);

            const result = service.verifyToken('valid-token');

            expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
            expect(result).toEqual(payload);
        });

        it('should throw error for invalid token', () => {
            (jwt.verify as any).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            expect(() => service.verifyToken('invalid-token')).toThrow(AppError);
        });
    });
});


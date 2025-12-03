/**
 * Auth API Integration Tests
 *
 * Note: These tests require a running test database.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';

const hasTestDb = process.env.DATABASE_URL?.includes('test');

describe.skipIf(!hasTestDb)('Auth API Integration', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'password123',
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('newuser@example.com');
            expect(response.body.data.token).toBeDefined();
        });

        it('should return 409 if user already exists', async () => {
            const email = 'duplicate@example.com';
            await request(app)
                .post('/api/auth/register')
                .send({
                    email,
                    password: 'password123',
                })
                .expect(201);

            await request(app)
                .post('/api/auth/register')
                .send({
                    email,
                    password: 'password123',
                })
                .expect(409);
        });

        it('should return 400 for invalid email', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'password123',
                })
                .expect(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const email = 'login@example.com';
            const password = 'password123';

            // Register first
            await request(app)
                .post('/api/auth/register')
                .send({ email, password })
                .expect(201);

            // Login
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email, password })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(email);
            expect(response.body.data.token).toBeDefined();
        });

        it('should return 401 for invalid credentials', async () => {
            await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword',
                })
                .expect(401);
        });
    });
});


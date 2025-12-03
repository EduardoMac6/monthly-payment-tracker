/**
 * Plans API Integration Tests
 *
 * Note: These tests require a running test database.
 * Set up a test database and configure DATABASE_URL in test environment.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';

// Skip tests if no test database is configured
const hasTestDb = process.env.DATABASE_URL?.includes('test');

describe.skipIf(!hasTestDb)('Plans API Integration', () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        // Setup: Register a test user and get token
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        authToken = registerResponse.body.data.token;
        userId = registerResponse.body.data.user.id;
    });

    afterAll(async () => {
        // Cleanup handled by test database reset
    });

    describe('GET /api/plans', () => {
        it('should return all plans for authenticated user', async () => {
            const response = await request(app)
                .get('/api/plans')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should return 401 without authentication', async () => {
            await request(app)
                .get('/api/plans')
                .expect(401);
        });
    });

    describe('POST /api/plans', () => {
        it('should create a new plan', async () => {
            const planData = {
                planName: 'Test Plan',
                totalAmount: 12000,
                numberOfMonths: 12,
                monthlyPayment: 1000,
                debtOwner: 'self',
                isActive: true,
            };

            const response = await request(app)
                .post('/api/plans')
                .set('Authorization', `Bearer ${authToken}`)
                .send(planData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.planName).toBe(planData.planName);
        });
    });

    describe('GET /api/plans/:id', () => {
        it('should return plan by ID', async () => {
            // First create a plan
            const createResponse = await request(app)
                .post('/api/plans')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    planName: 'Test Plan',
                    totalAmount: 1000,
                    numberOfMonths: 1,
                    monthlyPayment: 1000,
                });

            const planId = createResponse.body.data.id;

            const response = await request(app)
                .get(`/api/plans/${planId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(planId);
        });
    });

    describe('PUT /api/plans/:id', () => {
        it('should update plan', async () => {
            // Create plan first
            const createResponse = await request(app)
                .post('/api/plans')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    planName: 'Original Plan',
                    totalAmount: 1000,
                    numberOfMonths: 1,
                    monthlyPayment: 1000,
                });

            const planId = createResponse.body.data.id;

            const response = await request(app)
                .put(`/api/plans/${planId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    planName: 'Updated Plan',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.planName).toBe('Updated Plan');
        });
    });

    describe('DELETE /api/plans/:id', () => {
        it('should delete plan', async () => {
            // Create plan first
            const createResponse = await request(app)
                .post('/api/plans')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    planName: 'Plan to Delete',
                    totalAmount: 1000,
                    numberOfMonths: 1,
                    monthlyPayment: 1000,
                });

            const planId = createResponse.body.data.id;

            await request(app)
                .delete(`/api/plans/${planId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Verify plan is deleted
            await request(app)
                .get(`/api/plans/${planId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });
});


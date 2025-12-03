/**
 * Prisma Seed
 * Populates database with test data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            password: hashedPassword,
        },
    });

    console.log('✅ Created test user:', user.email);

    // Create test plans
    const plan1 = await prisma.plan.create({
        data: {
            userId: user.id,
            planName: 'Test Plan 1',
            totalAmount: 12000,
            numberOfMonths: 12,
            monthlyPayment: 1000,
            debtOwner: 'self',
            isActive: true,
        },
    });

    const plan2 = await prisma.plan.create({
        data: {
            userId: user.id,
            planName: 'Test Plan 2',
            totalAmount: 5000,
            numberOfMonths: 5,
            monthlyPayment: 1000,
            debtOwner: 'other',
            isActive: false,
        },
    });

    console.log('✅ Created test plans');

    // Create payment statuses for plan1
    const paymentStatuses = [];
    for (let i = 0; i < 12; i++) {
        paymentStatuses.push({
            planId: plan1.id,
            monthIndex: i,
            status: i < 3 ? 'paid' : 'pending',
            amount: 1000,
            paidAt: i < 3 ? new Date() : null,
        });
    }

    await prisma.paymentStatus.createMany({
        data: paymentStatuses,
    });

    // Create payment totals for plan1
    await prisma.paymentTotals.create({
        data: {
            planId: plan1.id,
            totalPaid: 3000,
            remaining: 9000,
        },
    });

    console.log('✅ Created payment data');

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


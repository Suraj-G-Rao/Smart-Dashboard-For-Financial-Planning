import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding FinanceAI database with sample data...\n');

  try {
    // Create a test user (note: in production, use proper auth)
    const user = await prisma.user.upsert({
      where: { email: 'demo@financeai.com' },
      update: {},
      create: {
        email: 'demo@financeai.com',
        name: 'Demo User',
        currency: 'INR',
        riskProfile: 'moderate',
        vaultSalt: require('crypto').randomBytes(32).toString('hex'),
      },
    });
    console.log('✅ Created demo user');

    // Seed Transactions (last 90 days)
    const transactions = [];
    const today = new Date();
    const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Rent'];
    
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Add 2-4 transactions per day
      const txCount = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < txCount; j++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const isExpense = Math.random() > 0.3; // 70% expenses, 30% income
        
        transactions.push({
          userId: user.id,
          amount: isExpense 
            ? Math.floor(Math.random() * 5000) + 500 // ₹500-5500
            : Math.floor(Math.random() * 50000) + 20000, // ₹20k-70k (salary/income)
          type: isExpense ? 'expense' : 'income',
          category: isExpense ? category : 'Salary',
          description: isExpense ? `${category} purchase` : 'Monthly salary',
          date,
        });
      }
    }

    await prisma.transaction.createMany({
      data: transactions,
      skipDuplicates: true,
    });
    console.log(`✅ Created ${transactions.length} transactions`);

    // Seed Goals
    await prisma.goal.createMany({
      data: [
        {
          userId: user.id,
          name: 'Emergency Fund',
          description: '6 months of expenses',
          targetAmount: 300000,
          savedAmount: 150000,
          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          priority: 1,
          status: 'Active',
          category: 'Emergency',
        },
        {
          userId: user.id,
          name: 'Dream Vacation to Europe',
          description: '2 weeks trip with family',
          targetAmount: 500000,
          savedAmount: 80000,
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
          priority: 2,
          status: 'Active',
          category: 'Vacation',
        },
        {
          userId: user.id,
          name: 'New Car',
          description: 'Down payment for SUV',
          targetAmount: 800000,
          savedAmount: 200000,
          targetDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years
          priority: 2,
          status: 'Active',
          category: 'Home',
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Created 3 financial goals');

    // Seed Salary History
    await prisma.salaryHistory.createMany({
      data: [
        {
          userId: user.id,
          date: new Date('2023-01-01'),
          baseCTC: 1200000,
          bonus: 50000,
          title: 'Senior Software Engineer',
          skills: ['React', 'Node.js', 'AWS'],
          city: 'Bangalore',
          company: 'Tech Corp',
        },
        {
          userId: user.id,
          date: new Date('2024-01-01'),
          baseCTC: 1500000,
          bonus: 75000,
          title: 'Senior Software Engineer',
          skills: ['React', 'Node.js', 'AWS', 'Python'],
          city: 'Bangalore',
          company: 'Tech Corp',
        },
        {
          userId: user.id,
          date: new Date('2025-01-01'),
          baseCTC: 1800000,
          bonus: 100000,
          title: 'Lead Software Engineer',
          skills: ['React', 'Node.js', 'AWS', 'Python', 'GenAI'],
          city: 'Bangalore',
          company: 'Tech Corp',
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Created salary history');

    // Seed Insurance Policies
    await prisma.insurancePolicy.createMany({
      data: [
        {
          userId: user.id,
          provider: 'HDFC Life',
          policyType: 'Term',
          policyNumber: 'TERM-2024-001',
          coverageAmount: 10000000, // ₹1 Crore
          premium: 15000,
          premiumCycle: 'yearly',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2044-01-01'), // 20 years
          nextPremiumOn: new Date('2025-01-01'),
          status: 'Active',
          notes: 'Term life insurance for family protection',
        },
        {
          userId: user.id,
          provider: 'Star Health',
          policyType: 'Health',
          policyNumber: 'HEALTH-2024-002',
          coverageAmount: 1000000, // ₹10 Lakh
          premium: 25000,
          premiumCycle: 'yearly',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2025-03-01'),
          nextPremiumOn: new Date('2025-03-01'),
          status: 'Active',
          notes: 'Family floater health insurance',
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Created insurance policies');

    // Seed Subscriptions
    await prisma.subscription.createMany({
      data: [
        {
          userId: user.id,
          service: 'Netflix',
          amount: 649,
          cycle: 'monthly',
          nextRenew: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
          category: 'Entertainment',
          isActive: true,
        },
        {
          userId: user.id,
          service: 'Amazon Prime',
          amount: 1499,
          cycle: 'yearly',
          nextRenew: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
          category: 'Entertainment',
          isActive: true,
        },
        {
          userId: user.id,
          service: 'Spotify Premium',
          amount: 119,
          cycle: 'monthly',
          nextRenew: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
          category: 'Music',
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Created subscriptions');

    // Seed Bills
    await prisma.bill.createMany({
      data: [
        {
          userId: user.id,
          name: 'Electricity Bill',
          amount: 3500,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
          category: 'Utilities',
          isPaid: false,
          recurring: true,
        },
        {
          userId: user.id,
          name: 'Internet Bill',
          amount: 1200,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
          category: 'Utilities',
          isPaid: false,
          recurring: true,
        },
        {
          userId: user.id,
          name: 'Credit Card Payment',
          amount: 25000,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          category: 'Credit Card',
          isPaid: false,
          recurring: false,
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Created bills');

    // Seed AI Insights
    await prisma.insight.createMany({
      data: [
        {
          userId: user.id,
          kind: 'coach_tip',
          content: {
            headline: 'You overspent 22% this week',
            tips: [
              {
                title: 'Reduce Food expenses',
                action: 'Cook at home 3 more days per week',
                impactINR: 1200,
              },
              {
                title: 'Limit Entertainment',
                action: 'Choose 1-2 outings per month',
                impactINR: 800,
              },
            ],
            riskFlags: ['High spending on weekends'],
          },
          metadata: { period: '7d', overspendPct: 22 },
        },
        {
          userId: user.id,
          kind: 'anomaly',
          content: {
            type: 'unusual_spend',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            amount: 8500,
            category: 'Shopping',
            message: 'Unusually high shopping expense detected',
          },
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Created AI insights');

    // Seed Vault Items (encrypted samples - using placeholder)
    await prisma.vaultItem.createMany({
      data: [
        {
          userId: user.id,
          title: 'PAN Card',
          type: 'document',
          path: '/uploads/pan-card.pdf',
          metadata: { size: 245000, mimetype: 'application/pdf' },
        },
        {
          userId: user.id,
          title: 'Bank Account Password',
          type: 'password',
          secret: 'encrypted_placeholder', // In real app, this would be encrypted
          iv: 'placeholder_iv',
          tag: 'placeholder_tag',
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Created vault items');

    console.log('\n✅ Database seeding complete!');
    console.log(`\n📧 Demo Login: demo@financeai.com`);
    console.log('🔑 Setup authentication to login\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

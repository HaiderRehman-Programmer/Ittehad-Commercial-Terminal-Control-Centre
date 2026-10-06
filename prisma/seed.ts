import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Real Estate Data (March/April 2026)...');

  // 1. Create/Update Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ittehad.com' },
    update: {},
    create: {
      email: 'admin@ittehad.com',
      name: 'Admin',
      password: 'hashed_password_here', // In a real app, hash this!
      role: 'ADMIN',
    },
  });

  // 2. Create/Update Wallet for Admin
  const wallet = await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      balance: 2200000.00,
      totalDebit: 1250000.00,
      totalCredit: 3450000.00,
    },
  });

  // 3. Create Sample Customer
  const customer = await prisma.customer.upsert({
    where: { cnic: '42101-1234567-1' },
    update: {},
    create: {
      name: 'Ali Ahmed',
      email: 'ali.ahmed@example.com',
      phone: '0300-1234567',
      cnic: '42101-1234567-1',
    },
  });

  // 4. Create Sample Property
  const property = await prisma.property.upsert({
    where: { shopNumber: 'Shop #14' },
    update: {},
    create: {
      shopNumber: 'Shop #14',
      status: 'SOLD',
      price: 2500000.00,
      area: 250.0,
    },
  });

  // 5. Create Detailed Transactions for March/April
  const transactions = [
    { date: new Date('2026-02-08'), debit: 50000, credit: 0, balanceAfter: 37600, description: 'Transfer: Waseem to Admin', walletId: wallet.id, customerId: customer.id },
    { date: new Date('2026-02-05'), debit: 12400, credit: 0, balanceAfter: -12400, description: 'Transfer: Khadim Hussain to Admin', walletId: wallet.id, customerId: customer.id },
    { date: new Date('2026-02-10'), debit: 0, credit: 750000, balanceAfter: 787600, description: 'Booking Receipt: Shop #14 - Ittehad Commercial', walletId: wallet.id, customerId: customer.id },
    { date: new Date('2026-02-12'), debit: 45000, credit: 0, balanceAfter: 742600, description: 'Utility Expense: Electricity & Maintenance (Feb)', walletId: wallet.id, customerId: customer.id },
    { date: new Date('2026-02-15'), debit: 0, credit: 350000, balanceAfter: 1092600, description: 'Installment: Customer - Ali Ahmed (Shop #22)', walletId: wallet.id, customerId: customer.id },
    { date: new Date('2026-02-18'), debit: 200000, credit: 0, balanceAfter: 892600, description: 'Refund: Cancelled Booking Shop #08', walletId: wallet.id, customerId: customer.id },
    { date: new Date('2026-02-20'), debit: 0, credit: 1200000, balanceAfter: 2092600, description: 'Full Payment: Shop #45 - Cash Deal', walletId: wallet.id, customerId: customer.id },
    { date: new Date('2026-02-22'), debit: 15000, credit: 0, balanceAfter: 2077600, description: 'Misc: Office Stationery & Tea', walletId: wallet.id, customerId: customer.id },
    { date: new Date('2026-02-25'), debit: 0, credit: 250000, balanceAfter: 2327600, description: 'Token Amount: New Booking - Shop #09', walletId: wallet.id, customerId: customer.id },
    { date: new Date('2026-02-28'), debit: 127600, credit: 0, balanceAfter: 2200000, description: 'Salary: Staff & Security Personnel (Feb)', walletId: wallet.id, customerId: customer.id }
  ];

  for (const txData of transactions) {
     await prisma.transaction.create({
        data: {
          amount: txData.debit > 0 ? txData.debit : txData.credit,
          type: txData.debit > 0 ? 'DEBIT' : 'CREDIT',
          status: 'COLLECTED',
          date: txData.date,
          description: txData.description,
          customerId: txData.customerId,
          // walletId: txData.walletId // Schema uses customer-to-transaction link as primary
        }
     });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

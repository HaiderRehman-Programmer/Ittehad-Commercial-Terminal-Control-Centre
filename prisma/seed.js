const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data from legacy sqlite3 implementation...');

  const hashedPassword = bcrypt.hashSync('admin123', 10);

  // 1. Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@realestate.com' },
    update: {},
    create: {
      name: 'General Admin',
      role: 'Super Admin',
      email: 'admin@realestate.com',
      mobile_no: '00000000000',
      password: hashedPassword,
      status: 1
    }
  });

  await prisma.user.upsert({
    where: { email: 'waseem@gmail.com' },
    update: {},
    create: { name: 'Waseem', role: 'Income', email: 'waseem@gmail.com', mobile_no: '03013219036', password: hashedPassword, status: 1 }
  });

  // 2. Roles
  const roles = ['Super Admin', 'Income', 'Expense', 'Sale Assistant'];
  for (const role of roles) {
    await prisma.role.create({ data: { name: role } });
  }

  // 3. Accounts
  const accounts = [
    { id: 1, name: 'Main Cash/Wallet Asset', type: 'asset', code: 'W001' },
    { id: 6, name: 'Plot Sales', type: 'income', code: '4001' },
    { id: 7, name: 'Token Income', type: 'income', code: '4002' },
    { id: 8, name: 'Installment Income', type: 'income', code: '4003' },
    { id: 14, name: 'Cash - Admin', type: 'asset', code: 'A001' },
    { id: 15, name: 'Cash - Waseem', type: 'asset', code: 'A002' },
    { id: 9, name: 'Kitchen Expense', type: 'expense', code: 'E001' }
  ];
  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: {},
      create: acc
    });
  }

  // 4. Properties (Plots)
  const plots = [
    { name: 'shop No 1', marla: '4.63 marla', dimensions: '40.00 x 31.60', status: 'available', price: 600000 },
    { name: 'shop No 2', marla: '2.50 marla', dimensions: '40.00 x 17.00', status: 'token', price: 600000 },
    { name: 'shop No 3', marla: '2.50 marla', dimensions: '40.00 x 17.00', status: 'token', price: 600000 },
    { name: 'shop No 4', marla: '2.50 marla', dimensions: '40.00 x 17.00', status: 'available', price: 600000 }
  ];
  for (const plot of plots) {
    await prisma.property.upsert({
      where: { name: plot.name },
      update: {},
      create: plot
    });
  }

  // 5. Customers
  const customers = [
    { name: 'WASIM', relation_name: 'ABBAS', cnic: '3130349272029', phone: '0302-684975', address: 'CHK 72 NP' },
    { name: 'Attiq', relation_name: 'Naeem', cnic: '3130454645321', phone: '03032321231', address: '' }
  ];
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { cnic: c.cnic },
      update: {},
      create: c
    });
  }

  // 6. Installment Types
  const types = ['6- Month', '12- Month', '24- Month'];
  for (const t of types) {
    await prisma.installmentType.create({ data: { name: t, status: 1 } });
  }

  // 7. Towns
  await prisma.town.create({
    data: { name: 'ITTEHAD COMMERCIAL CENTRE', address: 'CSP', acre: 0, kanal: 0, marla: 1800, status: 1 }
  });

  console.log(`Seeding complete:
    - User "${admin.name}" created/updated
    - ${roles.length} Roles added
    - ${accounts.length} Accounts synchronized
    - ${plots.length} Properties added
    - ${customers.length} Customers added
    - ${types.length} Installment Types added
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

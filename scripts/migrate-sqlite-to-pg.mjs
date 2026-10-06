/**
 * migrate-sqlite-to-pg.mjs
 * Automated Bridge for Real Estate ERP
 */

import { PrismaClient as SQLiteClient } from '@prisma/client';
// Note: In a real environment, you'd need two generated clients.
// For this script, we'll use a dynamic approach or assuming the schema is identical.

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const sqlite = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const postgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🚀 Starting SQLite to PostgreSQL migration...');

  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql')) {
    console.error('❌ Error: DATABASE_URL must be a valid postgresql connection string.');
    process.exit(1);
  }

  const models = [
    'user',
    'wallet',
    'town',
    'agent',
    'customer',
    'property',
    'token',
    'account',
    'transaction',
    'booking',
    'installment',
    'installmentType',
    'role',
    'landOwner',
    'townOwner',
    'pendingPayment',
    'transferRequest',
    'visitor',
    'auditLog'
  ];

  for (const model of models) {
    console.log(`📦 Migrating ${model}...`);
    try {
      const data = await sqlite[model].findMany();
      if (data.length === 0) {
        console.log(`   - No records in ${model}. Skipping.`);
        continue;
      }

      // Truncate PG table first? No, assume it's fresh.
      // Batch insert
      await postgres[model].createMany({
        data: data,
        skipDuplicates: true,
      });

      console.log(`   ✅ Migrated ${data.length} records.`);
    } catch (err) {
      console.error(`   ❌ Failed to migrate ${model}:`, err.message);
    }
  }

  console.log('🎉 Migration complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });

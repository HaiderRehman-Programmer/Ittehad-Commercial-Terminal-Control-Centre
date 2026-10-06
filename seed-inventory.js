import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Get or create a town
  let town = await prisma.town.findFirst();
  if (!town) {
    town = await prisma.town.create({
      data: {
        name: 'Main Phase 1',
        address: 'Downtown',
        acre: 10,
        status: 1
      }
    });
  }

  // Define statuses and types
  const statuses = ['available', 'token', 'booked', 'sold'];
  const types = ['Plot', 'Villa', 'Shop'];

  const newProperties = [];

  for (let i = 1; i <= 60; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Create random unique identifier
    const uniqueId = new Date().getTime() - Math.floor(Math.random() * 1000000) + i;
    const name = `${type}-${uniqueId}-${i}`;
    
    let marla = '5 Marla';
    let dimensions = '25x45';
    let price = 5000000;

    if (type === 'Villa') {
      marla = '10 Marla';
      dimensions = '35x65';
      price = 15000000;
    } else if (type === 'Shop') {
      marla = '2 Marla';
      dimensions = '15x30';
      price = 8000000;
    }

    newProperties.push({
      name,
      marla,
      dimensions,
      status,
      price,
      town_id: town.id
    });
  }

  // Insert properties
  const result = await prisma.property.createMany({
    data: newProperties
  });

  console.log(`Successfully inserted ${result.count} new properties.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

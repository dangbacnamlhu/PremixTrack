import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@premixtrack.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@premixtrack.com',
      passwordHash: hash,
      fullName: 'Quản trị viên',
      role: 'admin',
    },
  });
  console.log('Admin user:', admin.email);

  // Planner mẫu
  const plannerHash = await bcrypt.hash('planner123', 10);
  await prisma.user.upsert({
    where: { email: 'planner@premixtrack.com' },
    update: {},
    create: {
      username: 'planner1',
      email: 'planner@premixtrack.com',
      passwordHash: plannerHash,
      fullName: 'Nguyễn Văn A',
      role: 'planner',
    },
  });
  console.log('Planner user created.');

  // Inventory mẫu
  const ingredients = [
    { ingredientName: 'Bột mì', currentQuantity: 500, unit: 'kg', minThreshold: 100, location: 'Kho A' },
    { ingredientName: 'Đường', currentQuantity: 300, unit: 'kg', minThreshold: 50, location: 'Kho A' },
    { ingredientName: 'Muối', currentQuantity: 200, unit: 'kg', minThreshold: 30, location: 'Kho B' },
  ];
  for (const i of ingredients) {
    await prisma.inventory.upsert({
      where: { ingredientName: i.ingredientName },
      update: {},
      create: i,
    });
  }
  console.log('Inventory seed done.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

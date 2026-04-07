import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@jirani.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const adminName = process.env.ADMIN_NAME ?? 'System Admin';

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Admin ready: ${adminEmail}`);
}

void main()
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

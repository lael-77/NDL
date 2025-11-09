import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = 'password123';

async function addPasswordsToExistingUsers() {
  console.log('🔐 Adding passwords to existing users...');
  
  try {
    // Get all users without passwords
    const usersWithoutPasswords = await prisma.profile.findMany({
      where: {
        password: null,
      },
    });

    console.log(`Found ${usersWithoutPasswords.length} users without passwords`);

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // Update all users with default password
    for (const user of usersWithoutPasswords) {
      await prisma.profile.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    console.log(`✅ Updated ${usersWithoutPasswords.length} users with default password: ${DEFAULT_PASSWORD}`);
    console.log('⚠️  Please change these passwords in production!');
  } catch (error) {
    console.error('❌ Error adding passwords:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addPasswordsToExistingUsers();


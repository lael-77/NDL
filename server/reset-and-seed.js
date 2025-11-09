import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Resetting database...');
  
  try {
    // Clear all data in correct order (respecting foreign keys)
    console.log('🗑️  Clearing existing data...');
    await prisma.match.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.coach.deleteMany();
    await prisma.team.deleteMany();
    await prisma.school.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.challenge.deleteMany();
    
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    // Continue anyway - might be empty already
  }
  
  console.log('📦 Pushing schema changes...');
  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Schema updated');
  } catch (error) {
    console.error('❌ Error pushing schema:', error.message);
    process.exit(1);
  }
  
  console.log('🌱 Running seed script...');
  try {
    execSync('node prisma/seed.js', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Seed completed');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


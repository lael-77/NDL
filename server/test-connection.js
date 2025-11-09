// Quick test to verify database connection
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
    
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    await prisma.$disconnect();
    console.log('✅ Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Meta:', error.meta);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();


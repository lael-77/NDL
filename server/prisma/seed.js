import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = 'password123'; // Default password for all seeded users
const ADMIN_PASSWORD = 'Admin@NDL2024'; // Admin password

// Real Rwandan Schools (20 schools)
const SCHOOLS = [
  { name: 'College Saint André', location: 'Kigali' },
  { name: 'Green Hills Academy', location: 'Kigali' },
  { name: 'Nu Vision High School', location: 'Kigali' },
  { name: 'International School of Kigali', location: 'Kigali' },
  { name: 'Saint Patrick High School', location: 'Kigali' },
  { name: 'Maranyundo Girls School', location: 'Bugesera' },
  { name: 'Fawe Girls School', location: 'Kigali' },
  { name: 'Gashora Girls Academy', location: 'Bugesera' },
  { name: 'Agahozo Shalom Youth Village', location: 'Rwamagana' },
  { name: 'Kigali Christian School', location: 'Kigali' },
  { name: 'Lycee de Kigali', location: 'Kigali' },
  { name: 'Ape Rugunga', location: 'Kigali' },
  { name: 'Ecole Belge de Kigali', location: 'Kigali' },
  { name: 'GS Remera Protestant', location: 'Kigali' },
  { name: 'GS Kabuga Catholique', location: 'Kigali' },
  { name: 'Glory Secondary School', location: 'Kigali' },
  { name: 'Bright Angels International', location: 'Kigali' },
  { name: 'Lead International School', location: 'Kigali' },
  { name: 'Discovery International School', location: 'Kigali' },
  { name: 'Two Wings International School', location: 'Kigali' },
];

// Tiers (5 per school)
const TIERS = ['beginner', 'amateur', 'regular', 'professional', 'legendary'];
const STUDENT_ROLES = ['Developer', 'Designer', 'Strategist'];

// Coach surnames (100 unique surnames)
const COACH_SURNAMES = [
  'Mwangi', 'Ndayishimiye', 'Umutesi', 'Kamanzi', 'Bizimana',
  'Mukamana', 'Niyonzima', 'Habimana', 'Uwase', 'Ishimwe',
  'Nkurunziza', 'Rukundo', 'Niyomugabo', 'Kagabo', 'Nyirahabimana',
  'Nshimiyimana', 'Munyaneza', 'Iradukunda', 'Karegeya', 'Nyiransabimana',
  'Murekatete', 'Bizimungu', 'Musoni', 'Munyampundu', 'Rukebesha',
  'Ndoli', 'Ndayizeye', 'Mukankusi', 'Byukusenge', 'Iradukunda',
  'Habumugisha', 'Karamage', 'Bizimana', 'Munyaneza', 'Ndahiro',
  'Mukuru', 'Nshimiyimana', 'Umutoni', 'Habiyaremye', 'Ndayisaba',
  'Rwigamba', 'Ndayambaje', 'Iyakaremye', 'Mugenzi', 'Munyeshyaka',
  'Ngabonziza', 'Ishimwe', 'Mugisha', 'Ndagijimana', 'Iraguha',
  'Habirurema', 'Mugenzi', 'Bizimungu', 'Niyonzima', 'Manzi',
  'Niyonsaba', 'Ndizigiyimana', 'Munyampfu', 'Niyibizi', 'Munyakazi',
  'Ngabo', 'Nzabonimpa', 'Munyaneza', 'Ndayisaba', 'Kagabo',
  'Ndahindurwa', 'Munyankindi', 'Niyonzima', 'Nyiramahoro', 'Mukandori',
  'Nizeyimana', 'Munyaneza', 'Ibrahim', 'Kamana', 'Mugwaneza',
  'Turatsinze', 'Nshimiyimana', 'Niyonzima', 'Ndaye', 'Rurangwa',
  'Munyemana', 'Ndayambaje', 'Niyonzima', 'Ndahiro', 'Mukagata',
  'Rutayisire', 'Ishimwe', 'Ngabo', 'Niyonzima', 'Ibingira',
  'Rukundo', 'Ruhorahoza', 'Munyampfu', 'Munyazikwiye', 'Mutangana',
  'Ndikumana', 'Ngabo', 'Munyaneza', 'Uwimana', 'Ngirabatware',
];

// Student surnames (for generating 400 students)
const STUDENT_SURNAMES = [
  'Abe', 'Bari', 'Caro', 'Dion', 'Eden', 'Femi', 'Gabi', 'Hana',
  'Ibra', 'Jade', 'Kato', 'Lina', 'Musa', 'Nala', 'Omar', 'Pia',
  'Quin', 'Rami', 'Sara', 'Timo', 'Uma', 'Vera', 'Wale', 'Xena',
  'Yuri', 'Zane', 'Ari', 'Bela', 'Cami', 'Dani', 'Eli', 'Fara',
  'Gino', 'Hira', 'Ivan', 'Jana', 'Kira', 'Luca', 'Maya', 'Nico',
  'Omar', 'Pola', 'Quin', 'Ravi', 'Sami', 'Tara', 'Umar', 'Vera',
  'Wali', 'Xara', 'Yara', 'Zara', 'Amin', 'Bina', 'Cara', 'Dina',
  'Ella', 'Fina', 'Gina', 'Hina', 'Ina', 'Jina', 'Kina', 'Lina',
  'Mina', 'Nina', 'Ona', 'Pina', 'Qina', 'Rina', 'Sina', 'Tina',
  'Una', 'Vina', 'Wina', 'Xina', 'Yina', 'Zina', 'Aman', 'Baman',
  'Caman', 'Daman', 'Eman', 'Faman', 'Gaman', 'Haman', 'Iman', 'Jaman',
  'Kaman', 'Laman', 'Maman', 'Naman', 'Oman', 'Paman', 'Qaman', 'Raman',
  'Saman', 'Taman', 'Uman', 'Vaman', 'Waman', 'Xaman', 'Yaman', 'Zaman',
];

// Generate student names
function generateStudentName(index) {
  const firstNames = ['Student'];
  const surnameIndex = index % STUDENT_SURNAMES.length;
  const surname = STUDENT_SURNAMES[surnameIndex];
  const number = index + 1;
  return {
    first: `Student${number}`,
    last: surname,
    full: `Student${number} ${surname}`,
  };
}

// Generate coach names
function generateCoachName(index) {
  const surname = COACH_SURNAMES[index];
  const number = index + 1;
  return {
    first: `Coach${number}`,
    last: surname,
    full: `Coach${number} ${surname}`,
  };
}

// Generate email
function generateEmail(name, index, role) {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}@ndl.rw`;
}

// Generate team name
function generateTeamName(schoolName, tier) {
  const schoolPrefix = schoolName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
  const tierCapitalized = tier.charAt(0).toUpperCase() + tier.slice(1);
  return `${schoolPrefix} ${tierCapitalized} Team`;
}

// Generate random points based on tier
function generatePoints(tier) {
  const ranges = {
    beginner: { min: 0, max: 50 },
    amateur: { min: 30, max: 100 },
    regular: { min: 80, max: 200 },
    professional: { min: 150, max: 350 },
    legendary: { min: 300, max: 600 },
  };
  const range = ranges[tier] || ranges.beginner;
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// Generate match stats
function generateMatchStats(points) {
  const totalMatches = Math.floor(Math.random() * 15) + 5;
  const winRate = 0.4 + (points / 1000) * 0.3;
  const wins = Math.floor(totalMatches * winRate);
  const draws = Math.floor(totalMatches * 0.1);
  const losses = totalMatches - wins - draws;
  return { wins, draws, losses };
}

async function main() {
  console.log('🌱 Starting seed with real Rwandan data...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.challengeSubmission.deleteMany();
  await prisma.academyProgress.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.arenaApplication.deleteMany();
  await prisma.arena.deleteMany();
  await prisma.match.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.team.deleteMany();
  await prisma.school.deleteMany();
  await prisma.profile.deleteMany();

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Create 20 schools
  console.log('🏫 Creating 20 Rwandan schools...');
  const schools = [];
  for (let i = 0; i < SCHOOLS.length; i++) {
    const schoolData = SCHOOLS[i];
    const tier = TIERS[Math.floor(i / 4) % TIERS.length]; // Distribute tiers
    const school = await prisma.school.create({
      data: {
        name: schoolData.name,
        location: schoolData.location,
        tier: tier,
        motto: `Excellence in ${schoolData.name}`,
        sponsor: Math.random() > 0.5 ? 'MTN Rwanda' : null,
      },
    });
    schools.push(school);
  }

  // Create 100 coaches (5 per school, 1 per team)
  console.log('👨‍🏫 Creating 100 coaches...');
  const coaches = [];
  let coachIndex = 0;
  for (const school of schools) {
    for (let i = 0; i < 5; i++) {
      const coachName = generateCoachName(coachIndex);
      const email = generateEmail(coachName.full, coachIndex, 'coach');
      
      const coachProfile = await prisma.profile.create({
        data: {
          email: email,
          password: hashedPassword,
          fullName: coachName.full,
          role: 'coach',
        },
      });

      const coach = await prisma.coach.create({
        data: {
          profileId: coachProfile.id,
          schoolId: school.id,
        },
      });

      coaches.push({ ...coach, profile: coachProfile });
      coachIndex++;
    }
  }

  // Create 100 teams (5 per school, one per tier)
  console.log('👥 Creating 100 teams...');
  const teams = [];
  let teamIndex = 0;
  for (const school of schools) {
    for (let i = 0; i < 5; i++) {
      const tier = TIERS[i];
      const teamName = generateTeamName(school.name, tier);
      const points = generatePoints(tier);
      const stats = generateMatchStats(points);
      const coach = coaches[teamIndex];

      const team = await prisma.team.create({
        data: {
          name: teamName,
          schoolId: school.id,
          tier: tier,
          points: points,
          wins: stats.wins,
          draws: stats.draws,
          losses: stats.losses,
        },
      });

      teams.push({ ...team, coachId: coach.profile.id });
      teamIndex++;
    }
  }

  // Create 400 students (4 per team)
  console.log('🎓 Creating 400 students...');
  let studentIndex = 0;
  for (const team of teams) {
    const school = schools.find(s => s.id === team.schoolId);
    
    for (let i = 0; i < 4; i++) {
      const studentName = generateStudentName(studentIndex);
      const email = generateEmail(studentName.full, studentIndex, 'player');
      const age = Math.floor(Math.random() * 3) + 14; // 14-16
      const grade = Math.floor(Math.random() * 3) + 8; // 8-10
      const xp = Math.floor(Math.random() * 5000) + 1000; // 1000-6000 XP
      const studentRole = STUDENT_ROLES[Math.floor(Math.random() * STUDENT_ROLES.length)];

      const student = await prisma.profile.create({
        data: {
          email: email,
          password: hashedPassword,
          fullName: studentName.full,
          role: 'player',
          studentRole: studentRole,
          age: age,
          grade: grade,
          xp: xp,
          studentSchoolId: school.id,
        },
      });

      // Add student to team
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          playerId: student.id,
        },
      });

      // Set first student as captain
      if (i === 0) {
        await prisma.team.update({
          where: { id: team.id },
          data: { captainId: student.id },
        });
      }

      studentIndex++;
    }
  }

  // Create school admins (1 per school)
  console.log('👔 Creating 20 school admins...');
  for (let i = 0; i < schools.length; i++) {
    const school = schools[i];
    const adminName = `${school.name} Admin`;
    const email = `admin.${school.name.toLowerCase().replace(/\s+/g, '.')}@ndl.rw`;

    await prisma.profile.create({
      data: {
        email: email,
        password: hashedPassword,
        fullName: adminName,
        role: 'school_admin',
        schoolId: school.id,
      },
    });
  }

  // Create judges
  console.log('⚖️  Creating judges...');
  const judges = [
    { first: 'Juliana', last: 'Bakhtsizina', full: 'Juliana Bakhtsizina' },
    { first: 'Andre', last: 'Vacha', full: 'Andre Vacha' },
  ];

  for (const judge of judges) {
    const email = generateEmail(judge.full, 0, 'judge');
    await prisma.profile.create({
      data: {
        email: email,
        password: hashedPassword,
        fullName: judge.full,
        role: 'judge',
      },
    });
  }

  // Create sponsors
  console.log('💰 Creating sponsors...');
  const sponsors = [
    { first: 'Rachid', last: 'Flih', full: 'Rachid Flih' },
  ];

  for (const sponsor of sponsors) {
    const email = generateEmail(sponsor.full, 0, 'sponsor');
    await prisma.profile.create({
      data: {
        email: email,
        password: hashedPassword,
        fullName: sponsor.full,
        role: 'sponsor',
      },
    });
  }

  // Create league admin
  console.log('👑 Creating league admin...');
  await prisma.profile.create({
    data: {
      email: 'admin@ndl.rw',
      password: hashedAdminPassword,
      fullName: 'League Admin',
      role: 'admin',
    },
  });

  // Create additional admin (Ismael Kaleeba)
  await prisma.profile.create({
    data: {
      email: 'ismael.kaleeba@ndl.rw',
      password: hashedPassword,
      fullName: 'Ismael Kaleeba',
      role: 'admin',
    },
  });

  // Create 7 arenas (random schools)
  console.log('🏟️  Creating 7 arenas...');
  const arenaSchools = schools
    .sort(() => Math.random() - 0.5)
    .slice(0, 7);
  
  const arenas = [];
  for (const school of arenaSchools) {
    const capacity = Math.floor(Math.random() * 200) + 100; // 100-300 capacity
    const facilities = ['WiFi', 'Projectors', 'Sound System', 'Seating', 'Parking'].slice(0, Math.floor(Math.random() * 3) + 2);
    const tier = TIERS[Math.floor(Math.random() * TIERS.length)]; // Random tier
    
    const arena = await prisma.arena.create({
      data: {
        name: `${school.name} Arena`,
        schoolId: school.id,
        capacity: capacity,
        facilities: facilities.join(', '),
        tier: tier,
        isActive: true,
      },
    });
    arenas.push(arena);
  }

  // Create matches (past and future) for all teams
  console.log('⚽ Creating matches (past and future)...');
  const matches = [];
  
  // Group teams by tier
  const teamsByTier = {};
  for (const team of teams) {
    if (!teamsByTier[team.tier]) {
      teamsByTier[team.tier] = [];
    }
    teamsByTier[team.tier].push(team);
  }

  // Create matches for each tier
  for (const tier of TIERS) {
    const tierTeams = teamsByTier[tier] || [];
    if (tierTeams.length < 2) continue;

    // Create past matches (completed)
    const pastMatchCount = Math.floor(tierTeams.length * 1.5); // ~1.5 matches per team
    for (let i = 0; i < pastMatchCount; i++) {
      // Get two random teams from same tier
      const shuffled = [...tierTeams].sort(() => Math.random() - 0.5);
      const homeTeam = shuffled[0];
      const awayTeam = shuffled[1];
      
      if (homeTeam.id === awayTeam.id) continue;

      // Random past date (30-180 days ago)
      const daysAgo = Math.floor(Math.random() * 150) + 30;
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() - daysAgo);

      // Generate scores
      const homeScore = Math.floor(Math.random() * 5);
      const awayScore = Math.floor(Math.random() * 5);
      let winnerId = null;
      if (homeScore > awayScore) {
        winnerId = homeTeam.id;
      } else if (awayScore > homeScore) {
        winnerId = awayTeam.id;
      }

      // Random arena
      const arena = arenas[Math.floor(Math.random() * arenas.length)];

      const match = await prisma.match.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          arenaId: arena.id,
          scheduledAt: scheduledAt,
          status: 'completed',
          homeScore: homeScore,
          awayScore: awayScore,
          winnerId: winnerId,
        },
      });
      matches.push(match);
    }

    // Create future matches (scheduled)
    const futureMatchCount = Math.floor(tierTeams.length * 1.2); // ~1.2 matches per team
    for (let i = 0; i < futureMatchCount; i++) {
      // Get two random teams from same tier
      const shuffled = [...tierTeams].sort(() => Math.random() - 0.5);
      const homeTeam = shuffled[0];
      const awayTeam = shuffled[1];
      
      if (homeTeam.id === awayTeam.id) continue;

      // Random future date (1-60 days from now)
      const daysAhead = Math.floor(Math.random() * 59) + 1;
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + daysAhead);
      scheduledAt.setHours(14 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 4) * 15, 0, 0); // 2-8 PM, 15-min intervals

      // Random arena
      const arena = arenas[Math.floor(Math.random() * arenas.length)];

      const match = await prisma.match.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          arenaId: arena.id,
          scheduledAt: scheduledAt,
          status: 'scheduled',
          homeScore: 0,
          awayScore: 0,
        },
      });
      matches.push(match);
    }
  }

  // Create some in-progress matches
  console.log('🔥 Creating live matches...');
  const liveMatchCount = Math.min(5, Math.floor(matches.length * 0.1)); // ~10% of matches
  for (let i = 0; i < liveMatchCount; i++) {
    const tier = TIERS[Math.floor(Math.random() * TIERS.length)];
    const tierTeams = teamsByTier[tier] || [];
    if (tierTeams.length < 2) continue;

    const shuffled = [...tierTeams].sort(() => Math.random() - 0.5);
    const homeTeam = shuffled[0];
    const awayTeam = shuffled[1];
    
    if (homeTeam.id === awayTeam.id) continue;

    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() - 1); // Started 1 hour ago

    const arena = arenas[Math.floor(Math.random() * arenas.length)];
    const homeScore = Math.floor(Math.random() * 3);
    const awayScore = Math.floor(Math.random() * 3);

    await prisma.match.create({
      data: {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        arenaId: arena.id,
        scheduledAt: scheduledAt,
        status: 'in_progress',
        homeScore: homeScore,
        awayScore: awayScore,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${schools.length} schools`);
  console.log(`   - ${coaches.length} coaches`);
  console.log(`   - ${teams.length} teams`);
  console.log(`   - ${studentIndex} students`);
  console.log(`   - 20 school admins`);
  console.log(`   - 2 judges`);
  console.log(`   - 1 sponsor`);
  console.log(`   - 2 league admins`);
  console.log(`   - ${arenas.length} arenas`);
  console.log(`   - ${matches.length} matches (past, present, and future)`);
  console.log(`\n🔑 Default passwords:`);
  console.log(`   - All users: ${DEFAULT_PASSWORD}`);
  console.log(`   - Admin (admin@ndl.rw): ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

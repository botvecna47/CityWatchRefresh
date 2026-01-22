import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.evidence.deleteMany();
    await prisma.issueStatusUpdate.deleteMany();
    await prisma.issueUpvote.deleteMany();
    await prisma.authorityResponse.deleteMany();
    await prisma.issue.deleteMany();
    await prisma.department.deleteMany(); 
    await prisma.otpVerification.deleteMany();
    await prisma.user.deleteMany();
    await prisma.ward.deleteMany();
    await prisma.city.deleteMany();
    await prisma.state.deleteMany();
    await prisma.category.deleteMany();
    console.log('✅ Cleaned existing data');
  } catch (error) {
    console.log('⚠️ Cleanup warning:', error.message);
  }

  // Create State
  const maharashtra = await prisma.state.create({
    data: { name: 'Maharashtra', code: 'MH' }
  });

  // Create City
  const nagpur = await prisma.city.create({
    data: { name: 'Nagpur', stateId: maharashtra.id, isActive: true, pilotStartDate: new Date() }
  });

  // Create Wards
  const wardNames = ['Dharampeth', 'Sitabuldi', 'Sadar', 'Lakadganj', 'Dhantoli', 'Hanuman Nagar', 'Nehru Nagar', 'Gandhibagh'];
  const wards = [];
  for (let i = 0; i < wardNames.length; i++) {
    wards.push(await prisma.ward.create({
      data: { name: wardNames[i], number: String(i + 1), cityId: nagpur.id }
    }));
  }

  // Create Categories
  const categoriesData = [
    { name: 'Roads & Infrastructure', slug: 'roads', description: 'Potholes', icon: 'road', sortOrder: 1 },
    { name: 'Waste Management', slug: 'waste', description: 'Garbage', icon: 'trash', sortOrder: 2 },
    { name: 'Street Lights', slug: 'lights', description: 'Lights', icon: 'lightbulb', sortOrder: 3 },
    { name: 'Water Supply', slug: 'water', description: 'Water', icon: 'droplet', sortOrder: 4 },
    { name: 'Drainage', slug: 'drainage', description: 'Drainage', icon: 'waves', sortOrder: 5 },
    { name: 'Public Safety', slug: 'safety', description: 'Safety', icon: 'shield', sortOrder: 6 }
  ];
  const categories = [];
  for (const cat of categoriesData) {
    categories.push(await prisma.category.create({ data: cat }));
  }

  // Create Departments
  const departmentsData = [
    { name: 'Public Works Department', code: 'PWD', cityId: nagpur.id },
    { name: 'Solid Waste Management', code: 'SWM', cityId: nagpur.id },
    { name: 'Electrical Department', code: 'ELEC', cityId: nagpur.id },
    { name: 'Water Works', code: 'WW', cityId: nagpur.id },
    { name: 'Drainage Department', code: 'DRN', cityId: nagpur.id },
    { name: 'Safety Division', code: 'SAFE', cityId: nagpur.id }
  ];
  const departments = [];
  for (const dept of departmentsData) {
    departments.push(await prisma.department.create({ data: dept }));
  }

  // Create Users
  const password = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: { phone: '9999999999', passwordHash: password, name: 'Admin', role: 'SUPER_ADMIN', isPhoneVerified: true }
  });

  const moderator1 = await prisma.user.create({
    data: { phone: '9999999998', passwordHash: password, name: 'Mod1', role: 'MODERATOR', isPhoneVerified: true, assignedCityId: nagpur.id }
  });
  
  const moderator2 = await prisma.user.create({
    data: { phone: '9999999996', passwordHash: password, name: 'Mod2', role: 'MODERATOR', isPhoneVerified: true, assignedCityId: nagpur.id }
  });

  const citizen1 = await prisma.user.create({
    data: { phone: '9876543210', passwordHash: password, name: 'Citizen1', role: 'CITIZEN', isPhoneVerified: true }
  });

  const citizen2 = await prisma.user.create({
    data: { phone: '9876543211', passwordHash: password, name: 'Citizen2', role: 'CITIZEN', isPhoneVerified: true }
  });

  const citizen3 = await prisma.user.create({
    data: { phone: '9876543212', passwordHash: password, name: 'Citizen3', role: 'CITIZEN', isPhoneVerified: true }
  });

  console.log('✅ Created core data (Locations, Cats, Depts, Users)');

  // ISSUES - Create individually with error handling
  const createIssue = async (data, label) => {
    try {
      const issue = await prisma.issue.create({ data });
      console.log(`✅ Created ${label}`);
      return issue;
    } catch (e) {
      console.error(`❌ Failed ${label}:`, e.message);
      // console.error(e); // Uncomment for full trace if needed
      return null;
    }
  };

  const issue1 = await createIssue({
    title: 'Large pothole near Gandhi Chowk',
    description: 'Dangerous pothole repair needed.',
    address: 'Gandhi Chowk',
    wardId: wards[0].id,
    cityId: nagpur.id,
    categoryId: categories[0].id,
    departmentId: departments[0].id,
    reporterId: citizen1.id,
    severity: 'CRITICAL',
    status: 'VERIFIED',
    isVerified: true,
    verifiedAt: new Date(),
    moderatorId: moderator1.id,
    latitude: 21.1458,
    longitude: 79.0882,
    upvoteCount: 47
  }, 'Issue 1 (Pothole)');

  const issue2 = await createIssue({
    title: 'Garbage dump not cleared',
    description: 'Garbage causing foul smell.',
    address: 'Shankar Nagar',
    wardId: wards[1].id,
    cityId: nagpur.id,
    categoryId: categories[1].id, // Waste
    departmentId: departments[1].id, // SWM
    reporterId: citizen2.id,
    severity: 'HIGH',
    status: 'VERIFIED',
    isVerified: true,
    verifiedAt: new Date(),
    moderatorId: moderator2.id,
    latitude: 21.1398,
    longitude: 79.0856,
    upvoteCount: 32
  }, 'Issue 2 (Garbage)');

  const issue3 = await createIssue({
    title: 'Street lights not working',
    description: 'Darkness causing safety concerns.',
    address: 'MG Road',
    wardId: wards[2].id,
    cityId: nagpur.id,
    categoryId: categories[2].id,
    departmentId: departments[2].id,
    reporterId: citizen3.id,
    severity: 'MEDIUM',
    status: 'UNDER_REVIEW',
    isVerified: false,
    latitude: 21.1466,
    longitude: 79.0817,
    upvoteCount: 18
  }, 'Issue 3 (Lights)');

  const issue4 = await createIssue({
    title: 'Water leakage main pipeline',
    description: 'Water wasting.',
    address: 'Dharampeth Tower',
    wardId: wards[0].id,
    cityId: nagpur.id,
    categoryId: categories[3].id,
    departmentId: departments[3].id,
    reporterId: citizen1.id,
    severity: 'HIGH',
    status: 'REPORTED',
    isVerified: false,
    latitude: 21.1425,
    longitude: 79.0769,
    upvoteCount: 8
  }, 'Issue 4 (Water)');

  const issue5 = await createIssue({
    title: 'Blocked drain waterlogging',
    description: 'Blocked with debris.',
    address: 'Subhash Road',
    wardId: wards[3].id,
    cityId: nagpur.id,
    categoryId: categories[4].id,
    departmentId: departments[4].id,
    reporterId: citizen2.id,
    severity: 'MEDIUM',
    status: 'ESCALATED',
    isVerified: true,
    verifiedAt: new Date(),
    moderatorId: moderator1.id,
    latitude: 21.1512,
    longitude: 79.0894,
    upvoteCount: 55
  }, 'Issue 5 (Drain)');

  const issue6 = await createIssue({
    title: 'Open manhole danger',
    description: 'Missing cover near school.',
    address: 'Wardhaman Nagar',
    wardId: wards[4].id,
    cityId: nagpur.id,
    categoryId: categories[5].id,
    departmentId: departments[5].id,
    reporterId: citizen3.id,
    severity: 'CRITICAL',
    status: 'ACTION_TAKEN',
    isVerified: true,
    verifiedAt: new Date(),
    moderatorId: moderator1.id,
    latitude: 21.1378,
    longitude: 79.0812,
    upvoteCount: 89
  }, 'Issue 6 (Manhole)');

  console.log('\n✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Fatal Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

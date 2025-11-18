import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed common problems
  console.log('Seeding common problems...');
  const problems = await seedCommonProblems();

  // Seed parts and pricing
  console.log('Seeding parts...');
  await seedParts(problems);

  // Seed tires
  console.log('Seeding tires...');
  await seedTires();

  // Seed modifications
  console.log('Seeding modifications...');
  await seedModifications();

  // Seed maintenance guides
  console.log('Seeding maintenance guides...');
  await seedMaintenanceGuides(problems);

  console.log('✅ Database seeding completed!');
}

async function seedCommonProblems() {
  const problems = [
    {
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehicleYear: 2010,
      title: 'Dashboard Peeling',
      description:
        'Common issue where the dashboard material peels and cracks over time',
      symptoms: [
        'Visible peeling on dashboard',
        'Cracks in dashboard surface',
        'Material separation'
      ],
      preventionTips: [
        'Use sunshade when parking',
        'Apply dashboard protectant regularly',
        'Park in garage when possible'
      ],
      category: 'interior',
      severity: 'medium',
      mileageMin: 50000,
      mileageMax: 200000,
      frequency: 35,
      estimatedCostDiy: 5000, // in cents
      estimatedCostPro: 20000
    },
    {
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehicleYear: 2008,
      title: 'Transmission Shudder',
      description: 'Shuddering or jerking sensation during acceleration',
      symptoms: [
        'Shuddering when accelerating',
        'Jerky transmission shifts',
        'Loss of power occasionally'
      ],
      preventionTips: [
        'Keep transmission fluid clean',
        'Have fluid changed regularly',
        'Avoid towing heavy loads'
      ],
      category: 'transmission',
      severity: 'high',
      mileageMin: 100000,
      mileageMax: 250000,
      frequency: 22,
      estimatedCostDiy: 0, // Not DIY
      estimatedCostPro: 150000 // Major repair
    },
    {
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      vehicleYear: 2006,
      title: 'VTec Solenoid Leak',
      description: 'Oil leak from VTEC solenoid causing check engine light',
      symptoms: [
        'Oil leak near top of engine',
        'Check engine light (P0011)',
        'Possible loss of VTEC function'
      ],
      preventionTips: [
        'Use quality oil',
        'Change oil regularly',
        'Keep engine clean'
      ],
      category: 'engine',
      severity: 'medium',
      mileageMin: 80000,
      mileageMax: 180000,
      frequency: 28,
      estimatedCostDiy: 8000,
      estimatedCostPro: 30000
    },
    {
      vehicleMake: 'Ford',
      vehicleModel: 'F-150',
      vehicleYear: 2010,
      title: 'Spark Plug Blowout',
      description: '5.4L triton engines prone to spark plug ejection',
      symptoms: [
        'Spark plug comes out of engine',
        'Rough idle',
        'Misfire',
        'Check engine light'
      ],
      preventionTips: [
        'Use OEM spark plugs',
        'Consider helicoil repair',
        'Have plugs inspected regularly'
      ],
      category: 'engine',
      severity: 'critical',
      mileageMin: 60000,
      mileageMax: 200000,
      frequency: 45,
      estimatedCostDiy: 25000,
      estimatedCostPro: 50000
    },
    {
      vehicleMake: 'Jeep',
      vehicleModel: 'Wrangler',
      vehicleYear: 2007,
      title: 'Ball Joint Failure',
      description: 'Upper and lower ball joints wear out prematurely',
      symptoms: [
        'Clunking noise from suspension',
        'Steering wheel vibration',
        'Uneven tire wear',
        'Vehicle pulling to one side'
      ],
      preventionTips: [
        'Lubricate ball joints regularly',
        'Inspect suspension components',
        'Avoid rough terrain',
        'Keep wheel alignment correct'
      ],
      category: 'suspension',
      severity: 'high',
      mileageMin: 40000,
      mileageMax: 150000,
      frequency: 38,
      estimatedCostDiy: 40000,
      estimatedCostPro: 100000
    }
  ];

  const createdProblems = [];
  for (const problem of problems) {
    const created = await prisma.commonProblem.create({
      data: problem
    });
    createdProblems.push(created);
  }

  return createdProblems;
}

async function seedParts(problems: any[]) {
  const parts = [
    {
      problemId: problems[0].id, // Dashboard issue
      name: 'Dashboard Replacement Pad',
      description: 'Replacement dashboard pad for Toyota Camry',
      oemPartNumber: 'OEM-DASH-001',
      aftermarketPartNumbers: ['DASH-001', 'DASH-002'],
      estimatedCost: 15000, // in cents
      difficulty: 'hard',
      tools: ['Trim removal tool', 'Drill (for drilling out rivets)', 'Screwdrivers']
    },
    {
      problemId: problems[2].id, // VTEC solenoid
      name: 'VTEC Solenoid Assembly',
      description: 'OEM Honda VTEC solenoid assembly',
      oemPartNumber: 'OEM-VTEC-001',
      aftermarketPartNumbers: ['VTEC-001'],
      estimatedCost: 8000,
      difficulty: 'medium',
      tools: ['Socket set', 'Wrench set', 'Gasket scraper']
    },
    {
      problemId: problems[3].id, // Spark plug
      name: 'Spark Plug (OEM Ford)',
      description: 'OEM Ford spark plug for 5.4L Triton engine',
      oemPartNumber: 'OEM-PLUG-001',
      aftermarketPartNumbers: ['PLUG-001', 'AUTOLITE-001'],
      estimatedCost: 1000,
      difficulty: 'easy',
      tools: ['Spark plug socket', 'Ratchet', 'Socket extension']
    },
    {
      problemId: problems[3].id, // Helicoil repair kit
      name: 'Spark Plug Helicoil Repair Kit',
      description: 'Helicoil kit to repair stripped spark plug hole',
      oemPartNumber: 'HELICOIL-001',
      aftermarketPartNumbers: ['HELICOIL-001', 'TIMESERT-001'],
      estimatedCost: 3000,
      difficulty: 'hard',
      tools: [
        'Helicoil tool kit',
        'Drill bits',
        'Torque wrench',
        'Jack and jack stands'
      ]
    }
  ];

  for (const part of parts) {
    await prisma.part.create({
      data: part
    });
  }
}

async function seedTires() {
  const tires = [
    {
      vehicleYear: 2015,
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      brand: 'Michelin',
      model: 'Defender T+H',
      size: '205/65R16',
      season: 'all-season',
      treadWear: 820,
      traction: 'A',
      temperature: 'A',
      price: 7500, // in cents
      bestValue: true,
      retailer: 'Costco',
      url: 'https://www.costco.com/',
      rating: 4.5,
      warrantyYears: 5
    },
    {
      vehicleYear: 2015,
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      brand: 'Bridgestone',
      model: 'Turanza QuietTrack',
      size: '205/65R16',
      season: 'all-season',
      treadWear: 800,
      traction: 'A',
      temperature: 'A',
      price: 8500,
      bestValue: false,
      retailer: 'Tire Rack',
      url: 'https://www.tirerack.com/',
      rating: 4.7,
      warrantyYears: 6
    },
    {
      vehicleYear: 2015,
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      brand: 'Goodyear',
      model: 'Assurance ComfortDrive',
      size: '215/55R16',
      season: 'all-season',
      treadWear: 800,
      traction: 'A',
      temperature: 'A',
      price: 6500,
      bestValue: true,
      retailer: 'Walmart',
      url: 'https://www.walmart.com/cp/automotive/91001',
      rating: 4.4,
      warrantyYears: 5
    }
  ];

  for (const tire of tires) {
    await prisma.tire.create({
      data: tire
    });
  }
}

async function seedModifications() {
  const modifications = [
    {
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      vehicleYear: 2015,
      category: 'performance',
      title: 'Cold Air Intake',
      description: 'Improve engine breathing and increase horsepower',
      benefits: ['+10-15 HP', 'Better throttle response', 'Improved fuel economy'],
      estimatedCost: 25000, // in cents
      difficulty: 'easy',
      popularity: 9,
      ratingAverage: 4.6,
      reviewCount: 234,
      url: 'https://www.example.com/'
    },
    {
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      vehicleYear: 2015,
      category: 'appearance',
      title: 'LED Headlight Conversion',
      description: 'Upgrade to modern LED headlights',
      benefits: ['Better visibility', 'Modern look', 'Energy efficient'],
      estimatedCost: 60000,
      difficulty: 'medium',
      popularity: 8,
      ratingAverage: 4.5,
      reviewCount: 156,
      url: 'https://www.example.com/'
    },
    {
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehicleYear: 2015,
      category: 'comfort',
      title: 'Leather Seat Covers',
      description: 'Premium leather seat covers',
      benefits: [
        'Better comfort',
        'Increased interior value',
        'Easy to clean'
      ],
      estimatedCost: 40000,
      difficulty: 'easy',
      popularity: 7,
      ratingAverage: 4.4,
      reviewCount: 123,
      url: 'https://www.example.com/'
    }
  ];

  for (const modification of modifications) {
    await prisma.modification.create({
      data: modification
    });
  }
}

async function seedMaintenanceGuides(problems: any[]) {
  const guides = [
    {
      problemId: problems[2].id, // VTEC issue
      title: 'VTEC Solenoid Replacement Guide',
      description:
        'Step by step guide to replace the VTEC solenoid on your Honda Civic',
      steps: [
        'Disconnect negative battery terminal',
        'Remove intake manifold',
        'Locate VTEC solenoid',
        'Disconnect electrical connector',
        'Remove solenoid bolts',
        'Install new solenoid',
        'Reconnect everything',
        'Refill oil and test'
      ],
      estimatedTime: 120, // minutes
      difficulty: 'medium',
      tools: [
        'Socket set',
        'Wrench set',
        'Gasket scraper',
        'New gaskets',
        'Oil'
      ],
      requiredParts: ['VTEC Solenoid', 'Gaskets', 'Oil'],
      videoUrl: 'https://www.youtube.com/'
    },
    {
      problemId: problems[3].id, // Spark plug
      title: 'Ford Spark Plug Replacement (5.4L Triton)',
      description:
        'Guide to safely replace spark plugs on Ford F-150 with 5.4L engine',
      steps: [
        'Remove engine cover if equipped',
        'Disconnect coil pack',
        'Use correct socket to remove spark plug',
        'Insert new spark plug',
        'Torque to specification',
        'Reconnect coil pack',
        'Start engine and test'
      ],
      estimatedTime: 90,
      difficulty: 'easy',
      tools: ['Spark plug socket', 'Ratchet', 'Socket extension', 'Gap tool'],
      requiredParts: ['Spark plugs (OEM recommended)'],
      videoUrl: 'https://www.youtube.com/'
    }
  ];

  for (const guide of guides) {
    await prisma.maintenanceGuide.create({
      data: guide
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

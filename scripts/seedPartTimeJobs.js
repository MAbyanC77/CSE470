const mongoose = require('mongoose');
const University = require('../models/University');
require('dotenv').config();

// Sample part-time job data for different countries
const partTimeJobData = {
  'United States': {
    availability: 'Good',
    averageHourlyWage: { amount: 12, currency: 'USD' },
    popularFields: [
      {
        field: 'Campus Dining Services',
        description: 'Working in cafeterias, food courts, and dining halls',
        demandLevel: 'High'
      },
      {
        field: 'Library Assistant',
        description: 'Helping with book organization, research assistance, and front desk duties',
        demandLevel: 'Medium'
      },
      {
        field: 'Teaching Assistant',
        description: 'Assisting professors with grading, tutoring, and lab supervision',
        demandLevel: 'High'
      },
      {
        field: 'Campus Tour Guide',
        description: 'Leading prospective students and families on campus tours',
        demandLevel: 'Medium'
      }
    ],
    workPermitInfo: {
      onCampusAllowed: true,
      offCampusAllowed: true,
      hoursPerWeek: 20,
      additionalInfo: 'F-1 students can work on-campus without restriction and off-campus with proper authorization after first year.'
    },
    description: 'The US offers excellent part-time job opportunities for international students, with flexible schedules and competitive wages. Most universities have dedicated career centers to help students find suitable positions.'
  },
  'Canada': {
    availability: 'Excellent',
    averageHourlyWage: { amount: 15, currency: 'CAD' },
    popularFields: [
      {
        field: 'Research Assistant',
        description: 'Supporting faculty research projects and data collection',
        demandLevel: 'High'
      },
      {
        field: 'Campus Recreation',
        description: 'Working at gyms, sports facilities, and recreational centers',
        demandLevel: 'Medium'
      },
      {
        field: 'Administrative Support',
        description: 'Office work, data entry, and student services support',
        demandLevel: 'Medium'
      },
      {
        field: 'Retail and Food Service',
        description: 'Working in campus stores, coffee shops, and restaurants',
        demandLevel: 'High'
      }
    ],
    workPermitInfo: {
      onCampusAllowed: true,
      offCampusAllowed: true,
      hoursPerWeek: 20,
      additionalInfo: 'International students can work on-campus immediately and off-campus after 6 months of study with a valid study permit.'
    },
    description: 'Canada provides excellent part-time work opportunities with higher minimum wages and strong worker protections. The co-op program integration makes it easier to find relevant work experience.'
  },
  'United Kingdom': {
    availability: 'Good',
    averageHourlyWage: { amount: 10, currency: 'GBP' },
    popularFields: [
      {
        field: 'Student Union Jobs',
        description: 'Working in student bars, shops, and event management',
        demandLevel: 'High'
      },
      {
        field: 'Academic Support',
        description: 'Peer tutoring, study group facilitation, and academic mentoring',
        demandLevel: 'Medium'
      },
      {
        field: 'Campus Security',
        description: 'Evening and weekend security roles on campus',
        demandLevel: 'Medium'
      },
      {
        field: 'Event Staff',
        description: 'Supporting university events, conferences, and graduation ceremonies',
        demandLevel: 'Medium'
      }
    ],
    workPermitInfo: {
      onCampusAllowed: true,
      offCampusAllowed: true,
      hoursPerWeek: 20,
      additionalInfo: 'Tier 4 students can work up to 20 hours per week during term time and full-time during holidays.'
    },
    description: 'The UK offers good part-time opportunities, especially within university campuses. Student unions often provide the most accessible entry-level positions.'
  },
  'Australia': {
    availability: 'Excellent',
    averageHourlyWage: { amount: 22, currency: 'AUD' },
    popularFields: [
      {
        field: 'Hospitality',
        description: 'Cafes, restaurants, and catering services both on and off campus',
        demandLevel: 'High'
      },
      {
        field: 'Retail',
        description: 'Campus bookstores, clothing stores, and general retail',
        demandLevel: 'High'
      },
      {
        field: 'Tutoring',
        description: 'Private tutoring and academic support services',
        demandLevel: 'Medium'
      },
      {
        field: 'Delivery Services',
        description: 'Food delivery and courier services around campus areas',
        demandLevel: 'High'
      }
    ],
    workPermitInfo: {
      onCampusAllowed: true,
      offCampusAllowed: true,
      hoursPerWeek: 20,
      additionalInfo: 'Student visa holders can work up to 20 hours per week during study periods and unlimited hours during breaks.'
    },
    description: 'Australia offers some of the best part-time job opportunities globally with high minimum wages and strong employment rights. The hospitality sector is particularly welcoming to international students.'
  },
  'Germany': {
    availability: 'Good',
    averageHourlyWage: { amount: 12, currency: 'EUR' },
    popularFields: [
      {
        field: 'Student Assistant (HiWi)',
        description: 'Research and administrative support within university departments',
        demandLevel: 'High'
      },
      {
        field: 'Language Tutoring',
        description: 'Teaching English or native language to German students',
        demandLevel: 'Medium'
      },
      {
        field: 'IT Support',
        description: 'Technical support for university computer labs and systems',
        demandLevel: 'Medium'
      },
      {
        field: 'Campus Events',
        description: 'Supporting university events, orientations, and cultural programs',
        demandLevel: 'Medium'
      }
    ],
    workPermitInfo: {
      onCampusAllowed: true,
      offCampusAllowed: true,
      hoursPerWeek: 20,
      additionalInfo: 'Non-EU students can work 120 full days or 240 half days per year. EU students have no restrictions.'
    },
    description: 'Germany offers structured part-time opportunities, especially within universities. The HiWi (student assistant) system provides excellent academic work experience.'
  },
  'France': {
    availability: 'Fair',
    averageHourlyWage: { amount: 11, currency: 'EUR' },
    popularFields: [
      {
        field: 'Language Exchange',
        description: 'Conversation practice and language tutoring services',
        demandLevel: 'Medium'
      },
      {
        field: 'Campus Maintenance',
        description: 'Grounds keeping and facility maintenance support',
        demandLevel: 'Medium'
      },
      {
        field: 'Student Services',
        description: 'International student support and orientation assistance',
        demandLevel: 'Medium'
      },
      {
        field: 'Research Projects',
        description: 'Supporting academic research and data collection',
        demandLevel: 'Low'
      }
    ],
    workPermitInfo: {
      onCampusAllowed: true,
      offCampusAllowed: true,
      hoursPerWeek: 20,
      additionalInfo: 'Students can work up to 964 hours per year (about 20 hours per week during academic year).'
    },
    description: 'France provides moderate part-time opportunities with emphasis on academic-related work. Language skills in French significantly improve job prospects.'
  },
  'Netherlands': {
    availability: 'Good',
    averageHourlyWage: { amount: 11, currency: 'EUR' },
    popularFields: [
      {
        field: 'Bike Rental Services',
        description: 'Managing campus bike rental and maintenance services',
        demandLevel: 'Medium'
      },
      {
        field: 'Student Mentoring',
        description: 'Peer support and guidance for new international students',
        demandLevel: 'High'
      },
      {
        field: 'Campus Tours',
        description: 'Leading tours for prospective students and visitors',
        demandLevel: 'Medium'
      },
      {
        field: 'Lab Assistant',
        description: 'Supporting laboratory work and equipment maintenance',
        demandLevel: 'Medium'
      }
    ],
    workPermitInfo: {
      onCampusAllowed: true,
      offCampusAllowed: true,
      hoursPerWeek: 16,
      additionalInfo: 'Non-EU students can work 16 hours per week or full-time during summer months with proper permits.'
    },
    description: 'The Netherlands offers good opportunities with a focus on student support roles. English proficiency is often sufficient for campus jobs.'
  }
};

// Default data for countries not specifically listed
const defaultJobData = {
  availability: 'Fair',
  averageHourlyWage: { amount: 8, currency: 'USD' },
  popularFields: [
    {
      field: 'Campus Support',
      description: 'General campus maintenance and support services',
      demandLevel: 'Medium'
    },
    {
      field: 'Student Services',
      description: 'Administrative support and student assistance',
      demandLevel: 'Medium'
    },
    {
      field: 'Food Services',
      description: 'Campus dining and catering support',
      demandLevel: 'Medium'
    }
  ],
  workPermitInfo: {
    onCampusAllowed: true,
    offCampusAllowed: false,
    hoursPerWeek: 15,
    additionalInfo: 'Work opportunities may be limited. Check with international student services for current regulations.'
  },
  description: 'Part-time job opportunities are available but may be limited. Students should consult with university career services for guidance.'
};

async function seedPartTimeJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/education-platform');
    console.log('Connected to MongoDB');

    // Get all universities
    const universities = await University.find({});
    console.log(`Found ${universities.length} universities to update`);

    let updatedCount = 0;

    for (const university of universities) {
      // Get job data for the country or use default
      const jobData = partTimeJobData[university.country] || defaultJobData;
      
      // Update the university with part-time job data
      await University.findByIdAndUpdate(
        university._id,
        {
          $set: {
            'campusLife.partTimeJobOpportunities': jobData
          }
        }
      );
      
      updatedCount++;
      console.log(`Updated ${university.name} (${university.country})`);
    }

    console.log(`\nSuccessfully updated ${updatedCount} universities with part-time job data`);
    
  } catch (error) {
    console.error('Error seeding part-time job data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedPartTimeJobs();
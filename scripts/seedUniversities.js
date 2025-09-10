const mongoose = require('mongoose');
require('dotenv').config();
const University = require('../models/University');

// Exchange rates to BDT (approximate)
const exchangeRates = {
  USD: 110,
  CAD: 82,
  GBP: 140,
  AUD: 75,
  EUR: 120,
  MYR: 25,
  JPY: 0.8
};

const sampleUniversities = [
  // USA Universities
  {
    name: "Harvard University",
    country: "USA",
    city: "Cambridge",
    type: "Private",
    establishedYear: 1636,
    ranking: {
      world: 1,
      national: 1
    },
    tuitionFee: {
      undergraduate: {
        min: 54000,
        max: 57000,
        currency: "USD"
      },
      graduate: {
        min: 50000,
        max: 65000,
        currency: "USD"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 5940000,
        max: 6270000
      },
      graduate: {
        min: 5500000,
        max: 7150000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 120000,
        max: 180000
      },
      annual: {
        min: 1440000,
        max: 2160000
      }
    },
    visaFeeBDT: 35000,
    otherFeesBDT: {
      insurance: 45000,
      admin: 25000,
      application: 22000,
      total: 92000
    },
    logoUrl: "https://example.com/logos/harvard.png",
    programs: [
      {
        name: "Computer Science",
        level: "Bachelor",
        duration: "4 years",
        requirements: {
          gpa: 3.9,
          englishTest: "TOEFL",
          minScore: 110
        },
        applicationDeadline: new Date("2024-01-01")
      },
      {
        name: "Medicine",
        level: "Master",
        duration: "4 years",
        requirements: {
          gpa: 3.8,
          englishTest: "TOEFL",
          minScore: 100
        },
        applicationDeadline: new Date("2024-10-15")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.8,
        max: 4.0
      },
      englishTests: [
        {
          test: "TOEFL",
          minScore: 110
        },
        {
          test: "IELTS",
          minScore: 7.5
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-01-01")
      }
    },
    campusLife: {
      studentPopulation: 23000,
      internationalStudents: 5000
    },
    contact: {
      website: "https://www.harvard.edu",
      email: "admissions@harvard.edu"
    },
    description: "World's leading university with exceptional academic programs.",
    isActive: true
  },
  {
    name: "Stanford University",
    country: "USA",
    city: "Stanford",
    type: "Private",
    establishedYear: 1885,
    ranking: {
      world: 3,
      national: 2
    },
    tuitionFee: {
      undergraduate: {
        min: 56000,
        max: 58000,
        currency: "USD"
      },
      graduate: {
        min: 52000,
        max: 68000,
        currency: "USD"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 6160000,
        max: 6380000
      },
      graduate: {
        min: 5720000,
        max: 7480000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 130000,
        max: 200000
      },
      annual: {
        min: 1560000,
        max: 2400000
      }
    },
    visaFeeBDT: 35000,
    otherFeesBDT: {
      insurance: 50000,
      admin: 30000,
      application: 25000,
      total: 105000
    },
    logoUrl: "https://example.com/logos/stanford.png",
    programs: [
      {
        name: "Engineering",
        level: "Bachelor",
        duration: "4 years",
        requirements: {
          gpa: 3.9,
          englishTest: "TOEFL",
          minScore: 105
        },
        applicationDeadline: new Date("2024-01-02")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.8,
        max: 4.0
      },
      englishTests: [
        {
          test: "TOEFL",
          minScore: 105
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-01-02")
      }
    },
    campusLife: {
      studentPopulation: 17000,
      internationalStudents: 3500
    },
    contact: {
      website: "https://www.stanford.edu",
      email: "admission@stanford.edu"
    },
    description: "Leading technology and innovation university in Silicon Valley.",
    isActive: true
  },
  {
    name: "MIT",
    country: "USA",
    city: "Cambridge",
    type: "Private",
    establishedYear: 1861,
    ranking: {
      world: 2,
      national: 3
    },
    tuitionFee: {
      undergraduate: {
        min: 55000,
        max: 57000,
        currency: "USD"
      },
      graduate: {
        min: 53000,
        max: 70000,
        currency: "USD"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 6050000,
        max: 6270000
      },
      graduate: {
        min: 5830000,
        max: 7700000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 125000,
        max: 185000
      },
      annual: {
        min: 1500000,
        max: 2220000
      }
    },
    visaFeeBDT: 35000,
    otherFeesBDT: {
      insurance: 48000,
      admin: 28000,
      application: 24000,
      total: 100000
    },
    logoUrl: "https://example.com/logos/mit.png",
    programs: [
      {
        name: "Computer Science",
        level: "Bachelor",
        duration: "4 years",
        requirements: {
          gpa: 3.9,
          englishTest: "TOEFL",
          minScore: 110
        },
        applicationDeadline: new Date("2024-01-01")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.8,
        max: 4.0
      },
      englishTests: [
        {
          test: "TOEFL",
          minScore: 110
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-01-01")
      }
    },
    campusLife: {
      studentPopulation: 11500,
      internationalStudents: 3800
    },
    contact: {
      website: "https://www.mit.edu",
      email: "admissions@mit.edu"
    },
    description: "World-renowned institute for science, technology, and engineering.",
    isActive: true
  },
  
  // UK Universities
  {
    name: "University of Oxford",
    country: "UK",
    city: "Oxford",
    type: "Public",
    establishedYear: 1096,
    ranking: {
      world: 4,
      national: 1
    },
    tuitionFee: {
      undergraduate: {
        min: 28000,
        max: 39000,
        currency: "GBP"
      },
      graduate: {
        min: 25000,
        max: 45000,
        currency: "GBP"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 3920000,
        max: 5460000
      },
      graduate: {
        min: 3500000,
        max: 6300000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 100000,
        max: 150000
      },
      annual: {
        min: 1200000,
        max: 1800000
      }
    },
    visaFeeBDT: 45000,
    otherFeesBDT: {
      insurance: 35000,
      admin: 20000,
      application: 18000,
      total: 73000
    },
    logoUrl: "https://example.com/logos/oxford.png",
    programs: [
      {
        name: "Philosophy",
        level: "Bachelor",
        duration: "3 years",
        requirements: {
          gpa: 3.8,
          englishTest: "IELTS",
          minScore: 7.5
        },
        applicationDeadline: new Date("2024-01-15")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.7,
        max: 4.0
      },
      englishTests: [
        {
          test: "IELTS",
          minScore: 7.5
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-01-15")
      }
    },
    campusLife: {
      studentPopulation: 24000,
      internationalStudents: 12000
    },
    contact: {
      website: "https://www.ox.ac.uk",
      email: "admissions@ox.ac.uk"
    },
    description: "One of the oldest and most prestigious universities in the world.",
    isActive: true
  },
  {
    name: "University of Cambridge",
    country: "UK",
    city: "Cambridge",
    type: "Public",
    establishedYear: 1209,
    ranking: {
      world: 5,
      national: 2
    },
    tuitionFee: {
      undergraduate: {
        min: 27000,
        max: 38000,
        currency: "GBP"
      },
      graduate: {
        min: 24000,
        max: 44000,
        currency: "GBP"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 3780000,
        max: 5320000
      },
      graduate: {
        min: 3360000,
        max: 6160000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 95000,
        max: 145000
      },
      annual: {
        min: 1140000,
        max: 1740000
      }
    },
    visaFeeBDT: 45000,
    otherFeesBDT: {
      insurance: 35000,
      admin: 20000,
      application: 18000,
      total: 73000
    },
    logoUrl: "https://example.com/logos/cambridge.png",
    programs: [
      {
        name: "Mathematics",
        level: "Bachelor",
        duration: "3 years",
        requirements: {
          gpa: 3.8,
          englishTest: "IELTS",
          minScore: 7.5
        },
        applicationDeadline: new Date("2024-01-15")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.7,
        max: 4.0
      },
      englishTests: [
        {
          test: "IELTS",
          minScore: 7.5
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-01-15")
      }
    },
    campusLife: {
      studentPopulation: 23000,
      internationalStudents: 9000
    },
    contact: {
      website: "https://www.cam.ac.uk",
      email: "admissions@cam.ac.uk"
    },
    description: "Historic university renowned for academic excellence and research.",
    isActive: true
  },
  
  // Canada Universities
  {
    name: "University of Toronto",
    country: "Canada",
    city: "Toronto",
    type: "Public",
    establishedYear: 1827,
    ranking: {
      world: 25,
      national: 1
    },
    tuitionFee: {
      undergraduate: {
        min: 6100,
        max: 58160,
        currency: "CAD"
      },
      graduate: {
        min: 8000,
        max: 65000,
        currency: "CAD"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 500200,
        max: 4769120
      },
      graduate: {
        min: 656000,
        max: 5330000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 80000,
        max: 120000
      },
      annual: {
        min: 960000,
        max: 1440000
      }
    },
    visaFeeBDT: 25000,
    otherFeesBDT: {
      insurance: 35000,
      admin: 15000,
      application: 8000,
      total: 58000
    },
    logoUrl: "https://example.com/logos/uoft.png",
    programs: [
      {
        name: "Computer Science",
        level: "Bachelor",
        duration: "4 years",
        requirements: {
          gpa: 3.7,
          englishTest: "IELTS",
          minScore: 6.5
        },
        applicationDeadline: new Date("2024-01-15")
      },
      {
        name: "Engineering",
        level: "Bachelor",
        duration: "4 years",
        requirements: {
          gpa: 3.8,
          englishTest: "IELTS",
          minScore: 6.5
        },
        applicationDeadline: new Date("2024-01-15")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.7,
        max: 4.0
      },
      englishTests: [
        {
          test: "IELTS",
          minScore: 6.5
        },
        {
          test: "TOEFL",
          minScore: 100
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-01-15")
      }
    },
    campusLife: {
      studentPopulation: 97000,
      internationalStudents: 25000
    },
    contact: {
      website: "https://www.utoronto.ca",
      email: "admissions@utoronto.ca"
    },
    description: "Top-ranked Canadian university known for research excellence.",
    isActive: true
  },
  {
    name: "McGill University",
    country: "Canada",
    city: "Montreal",
    type: "Public",
    establishedYear: 1821,
    ranking: {
      world: 31,
      national: 2
    },
    tuitionFee: {
      undergraduate: {
        min: 4000,
        max: 50000,
        currency: "CAD"
      },
      graduate: {
        min: 6000,
        max: 55000,
        currency: "CAD"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 328000,
        max: 4100000
      },
      graduate: {
        min: 492000,
        max: 4510000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 75000,
        max: 110000
      },
      annual: {
        min: 900000,
        max: 1320000
      }
    },
    visaFeeBDT: 25000,
    otherFeesBDT: {
      insurance: 30000,
      admin: 12000,
      application: 7000,
      total: 49000
    },
    logoUrl: "https://example.com/logos/mcgill.png",
    programs: [
      {
        name: "Engineering",
        level: "Bachelor",
        duration: "4 years",
        requirements: {
          gpa: 3.7,
          englishTest: "IELTS",
          minScore: 6.5
        },
        applicationDeadline: new Date("2024-01-15")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.7,
        max: 4.0
      },
      englishTests: [
        {
          test: "IELTS",
          minScore: 6.5
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-01-15")
      }
    },
    campusLife: {
      studentPopulation: 40000,
      internationalStudents: 12000
    },
    contact: {
      website: "https://www.mcgill.ca",
      email: "admissions@mcgill.ca"
    },
    description: "Prestigious Canadian university with strong international reputation.",
    isActive: true
  },
  
  // Australia Universities
  {
    name: "University of Melbourne",
    country: "Australia",
    city: "Melbourne",
    type: "Public",
    establishedYear: 1853,
    ranking: {
      world: 33,
      national: 1
    },
    tuitionFee: {
      undergraduate: {
        min: 32000,
        max: 48000,
        currency: "AUD"
      },
      graduate: {
        min: 35000,
        max: 52000,
        currency: "AUD"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 2400000,
        max: 3600000
      },
      graduate: {
        min: 2625000,
        max: 3900000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 90000,
        max: 130000
      },
      annual: {
        min: 1080000,
        max: 1560000
      }
    },
    visaFeeBDT: 40000,
    otherFeesBDT: {
      insurance: 25000,
      admin: 15000,
      application: 10000,
      total: 50000
    },
    logoUrl: "https://example.com/logos/melbourne.png",
    programs: [
      {
        name: "Medicine",
        level: "Bachelor",
        duration: "6 years",
        requirements: {
          gpa: 3.7,
          englishTest: "IELTS",
          minScore: 7.0
        },
        applicationDeadline: new Date("2024-09-30")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.5,
        max: 4.0
      },
      englishTests: [
        {
          test: "IELTS",
          minScore: 6.5
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-09-30")
      }
    },
    campusLife: {
      studentPopulation: 50000,
      internationalStudents: 20000
    },
    contact: {
      website: "https://www.unimelb.edu.au",
      email: "admissions@unimelb.edu.au"
    },
    description: "Leading Australian university with excellent research programs.",
    isActive: true
  },
  
  // Germany Universities
  {
    name: "Technical University of Munich",
    country: "Germany",
    city: "Munich",
    type: "Public",
    establishedYear: 1868,
    ranking: {
      world: 50,
      national: 1
    },
    tuitionFee: {
      undergraduate: {
        min: 0,
        max: 3000,
        currency: "EUR"
      },
      graduate: {
        min: 0,
        max: 5000,
        currency: "EUR"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 0,
        max: 360000
      },
      graduate: {
        min: 0,
        max: 600000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 70000,
        max: 100000
      },
      annual: {
        min: 840000,
        max: 1200000
      }
    },
    visaFeeBDT: 20000,
    otherFeesBDT: {
      insurance: 15000,
      admin: 8000,
      application: 5000,
      total: 28000
    },
    logoUrl: "https://example.com/logos/tum.png",
    programs: [
      {
        name: "Engineering",
        level: "Bachelor",
        duration: "3 years",
        requirements: {
          gpa: 3.5,
          englishTest: "IELTS",
          minScore: 6.5
        },
        applicationDeadline: new Date("2024-07-15")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.3,
        max: 4.0
      },
      englishTests: [
        {
          test: "IELTS",
          minScore: 6.5
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-07-15")
      }
    },
    campusLife: {
      studentPopulation: 45000,
      internationalStudents: 15000
    },
    contact: {
      website: "https://www.tum.de",
      email: "admissions@tum.de"
    },
    description: "Top German technical university with excellent engineering programs.",
    isActive: true
  }
];

async function seedUniversities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing universities
    await University.deleteMany({});
    console.log('Cleared existing universities');
    
    // Insert new universities
    await University.insertMany(sampleUniversities);
    console.log(`Seeded ${sampleUniversities.length} universities`);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding universities:', error);
    process.exit(1);
  }
}

seedUniversities();
const mongoose = require('mongoose');
require('dotenv').config();
const University = require('../models/University');

const sampleUniversities = [
  {
    name: "Bangladesh University of Engineering and Technology (BUET)",
    country: "Bangladesh",
    city: "Dhaka",
    type: "Public",
    establishedYear: 1962,
    ranking: {
      world: 801,
      national: 1
    },
    tuitionFee: {
      undergraduate: {
        min: 1000,
        max: 2000,
        currency: "USD"
      },
      graduate: {
        min: 1500,
        max: 3000,
        currency: "USD"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 110000,
        max: 220000
      },
      graduate: {
        min: 165000,
        max: 330000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 15000,
        max: 25000
      },
      annual: {
        min: 180000,
        max: 300000
      }
    },
    visaFeeBDT: 5000,
    otherFeesBDT: {
      insurance: 8000,
      admin: 3000,
      application: 2000,
      total: 13000
    },
    logoUrl: "https://example.com/logos/buet.png",
    programs: [
      {
        name: "Computer Science and Engineering",
        level: "Bachelor",
        duration: "4 years",
        requirements: {
          gpa: 3.5,
          englishTest: "IELTS",
          minScore: 6.0
        },
        applicationDeadline: new Date("2024-06-15")
      },
      {
        name: "Electrical and Electronic Engineering",
        level: "Bachelor",
        duration: "4 years",
        requirements: {
          gpa: 3.4,
          englishTest: "IELTS",
          minScore: 6.0
        },
        applicationDeadline: new Date("2024-06-15")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.2,
        max: 4.0
      },
      englishTests: [
        {
          test: "IELTS",
          minScore: 6.0
        },
        {
          test: "TOEFL",
          minScore: 80
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-06-15")
      }
    },
    campusLife: {
      studentPopulation: 8000,
      internationalStudents: 200,
      campusSize: "69 acres"
    },
    contact: {
      website: "https://www.buet.ac.bd",
      email: "admission@buet.ac.bd",
      phone: "+880-2-9665650"
    },
    description: "Premier engineering university in Bangladesh, known for excellence in engineering and technology education.",
    isActive: true
  },
  {
    name: "University of Dhaka",
    country: "Bangladesh",
    city: "Dhaka",
    type: "Public",
    establishedYear: 1921,
    ranking: {
      world: 1001,
      national: 2
    },
    tuitionFee: {
      undergraduate: {
        min: 800,
        max: 1500,
        currency: "USD"
      },
      graduate: {
        min: 1200,
        max: 2500,
        currency: "USD"
      }
    },
    tuitionBDT: {
      undergraduate: {
        min: 88000,
        max: 165000
      },
      graduate: {
        min: 132000,
        max: 275000
      }
    },
    livingCostBDT: {
      monthly: {
        min: 12000,
        max: 20000
      },
      annual: {
        min: 144000,
        max: 240000
      }
    },
    visaFeeBDT: 5000,
    otherFeesBDT: {
      insurance: 6000,
      admin: 2500,
      application: 1500,
      total: 10000
    },
    logoUrl: "https://example.com/logos/du.png",
    programs: [
      {
        name: "Computer Science",
        level: "Bachelor",
        duration: "4 years",
        requirements: {
          gpa: 3.0,
          englishTest: "IELTS",
          minScore: 5.5
        },
        applicationDeadline: new Date("2024-07-20")
      },
      {
        name: "Business Administration",
        level: "Master",
        duration: "2 years",
        requirements: {
          gpa: 3.2,
          englishTest: "IELTS",
          minScore: 6.0
        },
        applicationDeadline: new Date("2024-07-20")
      }
    ],
    admissionRequirements: {
      gpa: {
        min: 3.0,
        max: 4.0
      },
      englishTests: [
        {
          test: "IELTS",
          minScore: 5.5
        }
      ]
    },
    applicationDeadlines: {
      fall: {
        regular: new Date("2024-07-20")
      }
    },
    campusLife: {
      studentPopulation: 46000,
      internationalStudents: 500
    },
    contact: {
      website: "https://www.du.ac.bd",
      email: "admission@du.ac.bd"
    },
    description: "Oldest university in Bangladesh, offering diverse academic programs.",
    isActive: true
  },
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
    description: "Canada's top university with world-class research and academic programs.",
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
    const result = await University.insertMany(sampleUniversities);
    console.log(`Successfully seeded ${result.length} universities`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding universities:', error);
    process.exit(1);
  }
}

seedUniversities();
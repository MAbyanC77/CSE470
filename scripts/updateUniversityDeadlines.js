const mongoose = require('mongoose');
require('dotenv').config();
const University = require('../models/University');

// Function to generate realistic deadlines until August 2026
function generateDeadlines() {
  const now = new Date();
  const deadlines = [];
  
  // Generate deadlines spread between now and August 2026
  const endDate = new Date(2026, 7, 31); // August 31, 2026
  const monthsUntilEnd = (endDate.getFullYear() - now.getFullYear()) * 12 + (endDate.getMonth() - now.getMonth());
  
  for (let i = 0; i < 20; i++) {
    const monthsFromNow = Math.floor(Math.random() * monthsUntilEnd) + 1; // 1 month to August 2026
    const days = Math.floor(Math.random() * 28) + 1; // Random day in month
    const deadline = new Date(now.getFullYear(), now.getMonth() + monthsFromNow, days);
    
    // Ensure deadline doesn't exceed August 2026
    if (deadline <= endDate) {
      deadlines.push(deadline);
    }
  }
  
  return deadlines;
}

// Function to determine if a program should be rolling admission
function shouldBeRolling() {
  return Math.random() < 0.2; // 20% chance of being rolling
}

// Update universities with deadline information
async function updateUniversityDeadlines() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduglobalbd');
    console.log('Connected to MongoDB');
    
    // Get all universities
    const universities = await University.find({ isActive: true });
    console.log(`Found ${universities.length} universities to update`);
    
    const availableDeadlines = generateDeadlines();
    let updatedCount = 0;
    let rollingCount = 0;
    
    for (const university of universities) {
      let hasUpdates = false;
      
      // Update each program with deadline information
      for (const program of university.programs) {
        const isRolling = shouldBeRolling();
        
        if (isRolling) {
          program.rolling = true;
          // Set rolling deadline to August 2026
          program.applicationDeadline = new Date('2026-08-31');
          rollingCount++;
        } else {
          program.rolling = false;
          // Assign a random deadline from our generated list
          const randomDeadline = availableDeadlines[Math.floor(Math.random() * availableDeadlines.length)];
          program.applicationDeadline = new Date(randomDeadline);
        }
        
        hasUpdates = true;
      }
      
      // Save university if it has updates
      if (hasUpdates) {
        await university.save();
        updatedCount++;
        
        console.log(`Updated ${university.name} (${university.country}) - ${university.programs.length} programs`);
      }
    }
    
    console.log(`\n✅ Update completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Universities updated: ${updatedCount}`);
    console.log(`   - Rolling admission programs: ${rollingCount}`);
    console.log(`   - Fixed deadline programs: ${universities.reduce((total, uni) => total + uni.programs.length, 0) - rollingCount}`);
    
    // Show some sample deadlines
    console.log(`\n📅 Sample upcoming deadlines:`);
    const sampleUni = await University.findOne({ isActive: true }).limit(1);
    if (sampleUni && sampleUni.programs.length > 0) {
      sampleUni.programs.slice(0, 3).forEach(program => {
        const deadline = program.rolling ? 'Rolling' : program.applicationDeadline.toDateString();
        console.log(`   - ${program.name} (${program.level}): ${deadline}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating university deadlines:', error);
    process.exit(1);
  }
}

// Run the update function
updateUniversityDeadlines();
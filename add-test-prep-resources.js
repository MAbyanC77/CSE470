const mongoose = require('mongoose');
const Resource = require('./models/Resource');

mongoose.connect('mongodb://localhost:27017/eduglobalbd', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const testPrepResources = [
    {
      title: 'IELTS Preparation Complete Guide',
      description: 'Comprehensive IELTS test preparation materials including practice tests, study schedules, and expert tips for all four skills.',
      category: 'Test Preparation',
      type: 'Guide',
      content: `Complete IELTS Preparation Resources:

📚 Official IELTS Practice Materials:
• IELTS Official Website: https://www.ielts.org/
• British Council IELTS: https://www.britishcouncil.org/exam/ielts
• IDP IELTS: https://www.idp.com/ielts/

📖 Free Practice Tests:
• IELTS Online Tests: https://ieltsonlinetests.com/
• IELTS Mentor: https://www.ielts-mentor.com/
• IELTS Liz: https://ieltsliz.com/

📝 Study Materials:
• Cambridge IELTS Books: https://www.cambridge.org/ielts
• Magoosh IELTS: https://magoosh.com/ielts/
• IELTS Simon: https://ielts-simon.com/

⏰ Study Schedule:
• 8-12 weeks preparation plan
• Daily 2-3 hours study routine
• Weekly practice tests
• Focus on weak areas`,
      tags: ['ielts', 'test preparation', 'english', 'study guide'],
      targetAudience: 'All',
      difficulty: 'Intermediate',
      author: 'Test Prep Team',
      featured: true,
      likes: 67,
      views: 445
    },
    {
      title: 'GRE Test Preparation Resources',
      description: 'Complete GRE preparation guide with practice materials, study schedules, and strategies for quantitative and verbal sections.',
      category: 'Test Preparation',
      type: 'Guide',
      content: `GRE Test Preparation Resources:

📚 Official GRE Materials:
• ETS Official GRE: https://www.ets.org/gre
• GRE PowerPrep: https://www.ets.org/gre/revised_general/prepare/powerprep/
• Official GRE Guide: https://www.ets.org/gre/revised_general/prepare/

📖 Free Practice Resources:
• Khan Academy GRE: https://www.khanacademy.org/test-prep/gre
• Magoosh GRE: https://gre.magoosh.com/
• Manhattan Prep GRE: https://www.manhattanprep.com/gre/

📝 Study Materials:
• Kaplan GRE: https://www.kaptest.com/gre
• Princeton Review GRE: https://www.princetonreview.com/grad/gre
• Barron's GRE: https://www.barronseduc.com/

⏰ Study Schedule:
• 12-16 weeks preparation plan
• Daily 3-4 hours study routine
• Weekly diagnostic tests
• Separate focus on Quant, Verbal, and AWA`,
      tags: ['gre', 'graduate', 'test preparation', 'quantitative', 'verbal'],
      targetAudience: 'Graduate',
      difficulty: 'Advanced',
      author: 'Graduate Prep Team',
      featured: true,
      likes: 89,
      views: 567
    },
    {
      title: 'TOEFL iBT Preparation Guide',
      description: 'Complete TOEFL iBT test preparation with practice tests, study materials, and strategies for reading, listening, speaking, and writing.',
      category: 'Test Preparation',
      type: 'Guide',
      content: `TOEFL iBT Preparation Resources:

📚 Official TOEFL Materials:
• ETS TOEFL Official: https://www.ets.org/toefl
• TOEFL iBT Free Practice Test: https://www.ets.org/toefl/test-takers/ibt/prepare/tests/
• TOEFL Practice Online: https://toeflpractice.ets.org/

📖 Free Practice Resources:
• TOEFL Resources: https://www.toeflresources.com/
• Magoosh TOEFL: https://magoosh.com/toefl/
• BestMyTest TOEFL: https://www.bestmytest.com/toefl

📝 Study Materials:
• Kaplan TOEFL: https://www.kaptest.com/toefl
• Princeton Review TOEFL: https://www.princetonreview.com/grad/toefl
• Barron's TOEFL: https://www.barronseduc.com/

⏰ Study Schedule:
• 8-12 weeks preparation plan
• Daily 2-3 hours study routine
• Weekly full-length practice tests
• Focus on all four skills: Reading, Listening, Speaking, Writing`,
      tags: ['toefl', 'test preparation', 'english', 'ibt'],
      targetAudience: 'All',
      difficulty: 'Intermediate',
      author: 'English Test Prep Team',
      featured: false,
      likes: 54,
      views: 378
    },
    {
      title: 'Test Preparation Study Schedule Template',
      description: 'Customizable study schedule templates for IELTS, TOEFL, GRE, and other standardized tests with weekly planning guides.',
      category: 'Test Preparation',
      type: 'Template',
      content: `Test Preparation Study Schedule Templates:

📅 IELTS Study Schedule (8-12 weeks):
• Week 1-2: Diagnostic test and skill assessment
• Week 3-4: Reading and Listening focus
• Week 5-6: Writing Task 1 & 2 practice
• Week 7-8: Speaking practice and mock tests
• Week 9-10: Full practice tests and review
• Week 11-12: Final preparation and test strategies

📅 GRE Study Schedule (12-16 weeks):
• Week 1-2: Diagnostic test and baseline
• Week 3-6: Quantitative Reasoning focus
• Week 7-10: Verbal Reasoning focus
• Week 11-12: Analytical Writing practice
• Week 13-14: Full practice tests
• Week 15-16: Review and test strategies

📅 TOEFL Study Schedule (8-12 weeks):
• Week 1-2: Diagnostic and skill assessment
• Week 3-4: Reading and Listening practice
• Week 5-6: Speaking practice
• Week 7-8: Writing practice
• Week 9-10: Integrated tasks practice
• Week 11-12: Full tests and final review

📊 Daily Study Tips:
• Set specific daily goals
• Track progress weekly
• Take regular breaks
• Review mistakes thoroughly
• Practice under timed conditions`,
      tags: ['study schedule', 'test preparation', 'planning', 'template'],
      targetAudience: 'All',
      difficulty: 'Beginner',
      author: 'Study Planning Team',
      featured: false,
      likes: 43,
      views: 289
    },
    {
      title: 'Free Test Preparation Websites Directory',
      description: 'Comprehensive directory of free online resources for IELTS, TOEFL, GRE, GMAT, and other standardized test preparation.',
      category: 'Test Preparation',
      type: 'Guide',
      content: `Free Test Preparation Websites Directory:

🌐 Multi-Test Platforms:
• Khan Academy: https://www.khanacademy.org/test-prep
• Magoosh: https://magoosh.com/ (Free trials available)
• 4Tests: https://www.4tests.com/
• Test Guide: https://www.test-guide.com/

📚 IELTS Specific:
• IELTS Online Tests: https://ieltsonlinetests.com/
• IELTS Mentor: https://www.ielts-mentor.com/
• IELTS Liz: https://ieltsliz.com/
• Road to IELTS: https://www.britishcouncil.org/exam/ielts/prepare

📚 TOEFL Specific:
• TOEFL Resources: https://www.toeflresources.com/
• Good Luck TOEFL: https://www.goodlucktoefl.com/
• TOEFL iBT Prep: https://www.ets.org/toefl/test-takers/ibt/prepare/

📚 GRE Specific:
• GRE Prep Club: https://greprepclub.com/
• Manhattan Prep GRE Blog: https://www.manhattanprep.com/gre/blog/
• Vocab Videos: https://www.vocabvideos.com/

📚 GMAT Specific:
• GMAT Club: https://gmatclub.com/
• Beat the GMAT: https://www.beatthegmat.com/
• GMAT Prep Now: https://www.gmatprepnow.com/

💡 Study Tips:
• Use multiple resources for comprehensive preparation
• Take advantage of free trials
• Join online study groups and forums
• Practice regularly with timed tests`,
      tags: ['free resources', 'test preparation', 'websites', 'directory'],
      targetAudience: 'All',
      difficulty: 'Beginner',
      author: 'Resource Curation Team',
      featured: false,
      likes: 76,
      views: 512
    }
  ];

  try {
    for (const resource of testPrepResources) {
      const newResource = new Resource(resource);
      await newResource.save();
      console.log(`Created resource: ${resource.title}`);
    }
    console.log('Test preparation resources added successfully!');
  } catch (error) {
    console.error('Error creating resources:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
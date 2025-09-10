const mongoose = require('mongoose');
const Resource = require('./models/Resource');

mongoose.connect('mongodb://localhost:27017/eduglobalbd', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const sampleResources = [
    {
      title: 'Complete Guide to University Applications',
      description: 'A comprehensive guide covering everything from choosing universities to submitting applications successfully.',
      category: 'Application Guides',
      type: 'Guide',
      content: `This comprehensive guide will walk you through every step of the university application process...

1. Research Phase
- Identify your academic goals and career aspirations
- Research universities that align with your interests
- Consider factors like location, cost, and program quality

2. Preparation Phase
- Gather required documents (transcripts, test scores, etc.)
- Write compelling personal statements
- Secure strong letters of recommendation

3. Application Phase
- Complete applications thoroughly and accurately
- Meet all deadlines
- Follow up appropriately

4. Decision Phase
- Compare offers carefully
- Consider financial aid packages
- Make informed decisions about your future`,
      tags: ['university', 'application', 'guide', 'admissions'],
      targetAudience: 'Undergraduate',
      difficulty: 'Beginner',
      author: 'EduGlobal Team',
      featured: true,
      likes: 45,
      views: 234
    },
    {
      title: 'Scholarship Application Template',
      description: 'A proven template for writing compelling scholarship applications that get results.',
      category: 'Scholarship Resources',
      type: 'Template',
      content: `SCHOLARSHIP APPLICATION TEMPLATE

[Your Name]
[Your Address]
[Date]

[Scholarship Committee Name]
[Organization Name]
[Address]

Dear Scholarship Committee,

I am writing to apply for the [Scholarship Name] offered by [Organization]. As a [your current status/year], I am passionate about [your field of study] and committed to [your goals].

ACADEMIC ACHIEVEMENTS:
- [List your GPA, honors, awards]
- [Relevant coursework]
- [Academic projects]

EXTRACURRICULAR ACTIVITIES:
- [Leadership roles]
- [Volunteer work]
- [Community involvement]

FINANCIAL NEED:
[Explain your financial situation and why you need the scholarship]

FUTURE GOALS:
[Describe your career aspirations and how this scholarship will help]

Thank you for considering my application. I look forward to contributing to [organization's mission].

Sincerely,
[Your Signature]
[Your Printed Name]`,
      tags: ['scholarship', 'template', 'application', 'financial aid'],
      targetAudience: 'All',
      difficulty: 'Beginner',
      author: 'Financial Aid Office',
      featured: true,
      likes: 67,
      views: 189
    },
    {
      title: 'IELTS Preparation Checklist',
      description: 'Essential checklist to prepare for IELTS exam with study timeline and resources.',
      category: 'Test Preparation',
      type: 'Checklist',
      content: `IELTS PREPARATION CHECKLIST

📋 3 MONTHS BEFORE EXAM:
☐ Take a practice test to assess current level
☐ Identify weak areas (Reading, Writing, Listening, Speaking)
☐ Create a study schedule
☐ Gather study materials (books, online resources)
☐ Register for the exam

📋 2 MONTHS BEFORE EXAM:
☐ Focus on weak areas with targeted practice
☐ Practice writing Task 1 and Task 2 essays daily
☐ Improve vocabulary with academic word lists
☐ Practice speaking with native speakers or language partners
☐ Take weekly practice tests

📋 1 MONTH BEFORE EXAM:
☐ Increase practice test frequency
☐ Time yourself strictly during practice
☐ Review grammar rules and common mistakes
☐ Practice pronunciation and fluency
☐ Familiarize yourself with exam format

📋 1 WEEK BEFORE EXAM:
☐ Take final practice tests
☐ Review test day procedures
☐ Prepare required documents
☐ Plan your route to test center
☐ Get adequate rest

📋 EXAM DAY:
☐ Arrive early at test center
☐ Bring required identification
☐ Stay calm and confident
☐ Read instructions carefully
☐ Manage time effectively`,
      tags: ['IELTS', 'test preparation', 'checklist', 'English'],
      targetAudience: 'All',
      difficulty: 'Intermediate',
      author: 'Test Prep Specialists',
      featured: false,
      likes: 23,
      views: 156
    },
    {
      title: 'Student Visa Application Guide',
      description: 'Step-by-step guide for applying for student visas in major study destinations.',
      category: 'Visa Information',
      type: 'Guide',
      content: `STUDENT VISA APPLICATION GUIDE

GENERAL REQUIREMENTS:

1. ACCEPTANCE LETTER
- Official letter from educational institution
- Must specify program details and duration
- Should include start and end dates

2. FINANCIAL DOCUMENTATION
- Bank statements (usually 3-6 months)
- Scholarship letters (if applicable)
- Sponsor affidavit (if sponsored)
- Proof of tuition payment

3. ACADEMIC DOCUMENTS
- Official transcripts
- Degree certificates
- English proficiency test scores
- Academic references

4. PERSONAL DOCUMENTS
- Valid passport (6+ months validity)
- Passport-sized photographs
- Birth certificate
- Medical examination results

COUNTRY-SPECIFIC REQUIREMENTS:

USA (F-1 Visa):
- Form I-20 from SEVP-approved school
- SEVIS fee payment
- DS-160 form completion
- Embassy interview

UK (Student Visa):
- CAS (Confirmation of Acceptance for Studies)
- Tuberculosis test (if required)
- Academic Technology Approval Scheme (if applicable)

Canada (Study Permit):
- Letter of acceptance from DLI
- Provincial attestation letter (if required)
- Biometrics appointment

Australia (Student Visa Subclass 500):
- CoE (Confirmation of Enrolment)
- Overseas Student Health Cover
- Genuine Temporary Entrant requirement

TIPS FOR SUCCESS:
- Apply early (3-4 months before travel)
- Ensure all documents are translated and notarized
- Be honest in your application
- Prepare for visa interview thoroughly
- Keep copies of all documents`,
      tags: ['visa', 'immigration', 'student visa', 'documentation'],
      targetAudience: 'All',
      difficulty: 'Advanced',
      author: 'Immigration Consultants',
      featured: true,
      likes: 89,
      views: 312
    },
    {
      title: 'Personal Statement Writing Template',
      description: 'Professional template and examples for writing compelling personal statements.',
      category: 'Application Guides',
      type: 'Template',
      content: `PERSONAL STATEMENT TEMPLATE

PARAGRAPH 1: OPENING HOOK
[Start with an engaging story, quote, or experience that relates to your field]

Example: "The moment I witnessed a surgeon save a life during my hospital volunteer work, I knew that medicine was not just a career choice for me—it was my calling."

PARAGRAPH 2: ACADEMIC BACKGROUND
[Discuss your academic achievements and how they prepared you for this program]

- Relevant coursework
- Research experience
- Academic projects
- GPA and honors (if strong)

PARAGRAPH 3: PROFESSIONAL/PRACTICAL EXPERIENCE
[Highlight work experience, internships, or practical applications]

- Internships in your field
- Relevant work experience
- Volunteer activities
- Leadership roles

PARAGRAPH 4: PERSONAL QUALITIES & SKILLS
[Showcase personal attributes that make you a strong candidate]

- Problem-solving abilities
- Communication skills
- Cultural awareness
- Resilience and adaptability

PARAGRAPH 5: WHY THIS PROGRAM/UNIVERSITY
[Demonstrate knowledge of the program and explain fit]

- Specific faculty you want to work with
- Unique program features
- Research opportunities
- Career services

PARAGRAPH 6: FUTURE GOALS
[Explain your career aspirations and how this program helps achieve them]

- Short-term goals (immediately after graduation)
- Long-term career vision
- How you'll contribute to your field
- Impact you want to make

CONCLUSION:
[Tie everything together and end with a strong statement]

DO'S:
✓ Be specific and provide examples
✓ Show, don't just tell
✓ Maintain a positive tone
✓ Proofread carefully
✓ Stay within word limits

DON'TS:
✗ Use clichés or generic statements
✗ Repeat information from your resume
✗ Make excuses for weaknesses
✗ Use overly complex language
✗ Submit without proofreading`,
      tags: ['personal statement', 'template', 'writing', 'admissions'],
      targetAudience: 'All',
      difficulty: 'Intermediate',
      author: 'Admissions Counselors',
      featured: false,
      likes: 34,
      views: 198
    },
    {
      title: 'Study Abroad Budget Calculator',
      description: 'Comprehensive budget planning tool with cost breakdowns for major study destinations.',
      category: 'Financial Planning',
      type: 'Template',
      content: `STUDY ABROAD BUDGET CALCULATOR

💰 TUITION COSTS (Annual)

USA:
- Public Universities: $10,000 - $35,000
- Private Universities: $35,000 - $70,000
- Community Colleges: $3,000 - $8,000

UK:
- Undergraduate: £10,000 - £38,000
- Postgraduate: £11,000 - £45,000
- MBA Programs: £15,000 - £80,000

Canada:
- Undergraduate: CAD $15,000 - $50,000
- Postgraduate: CAD $18,000 - $60,000

Australia:
- Undergraduate: AUD $20,000 - $45,000
- Postgraduate: AUD $22,000 - $50,000

🏠 LIVING EXPENSES (Monthly)

ACCOMMODATION:
- On-campus housing: $400 - $1,200
- Off-campus apartment: $500 - $2,000
- Shared accommodation: $300 - $800
- Homestay: $600 - $1,000

FOOD & GROCERIES:
- Meal plans: $200 - $500
- Cooking at home: $150 - $400
- Eating out frequently: $400 - $800

TRANSPORTATION:
- Public transport pass: $50 - $150
- Bicycle: $20 - $50 (maintenance)
- Car (if needed): $200 - $500

OTHER EXPENSES:
- Books & supplies: $50 - $200
- Personal expenses: $100 - $300
- Entertainment: $100 - $400
- Health insurance: $50 - $300
- Phone plan: $30 - $80

📊 BUDGET PLANNING WORKSHEET

INCOME SOURCES:
□ Personal savings: $______
□ Family contribution: $______
□ Scholarships: $______
□ Student loans: $______
□ Part-time work: $______
□ Assistantships: $______
TOTAL INCOME: $______

EXPENSES:
□ Tuition & fees: $______
□ Accommodation: $______
□ Food: $______
□ Transportation: $______
□ Books & supplies: $______
□ Personal expenses: $______
□ Health insurance: $______
□ Emergency fund (10%): $______
TOTAL EXPENSES: $______

BUDGET BALANCE: $______ (Income - Expenses)

💡 MONEY-SAVING TIPS:

1. ACCOMMODATION:
- Consider shared housing
- Look for university housing
- Explore homestay options
- Check for housing subsidies

2. FOOD:
- Cook meals at home
- Buy groceries in bulk
- Use student discounts
- Join meal sharing programs

3. TRANSPORTATION:
- Use student transit passes
- Walk or bike when possible
- Carpool with classmates
- Take advantage of free campus shuttles

4. TEXTBOOKS:
- Buy used books
- Rent textbooks
- Use library resources
- Share books with classmates

5. ENTERTAINMENT:
- Attend free campus events
- Use student discounts
- Explore free local attractions
- Join student organizations`,
      tags: ['budget', 'financial planning', 'calculator', 'costs'],
      targetAudience: 'All',
      difficulty: 'Beginner',
      author: 'Financial Planning Team',
      featured: false,
      likes: 56,
      views: 267
    }
  ];
  
  for (const resourceData of sampleResources) {
    const resource = new Resource(resourceData);
    await resource.save();
    console.log('Created resource:', resource.title);
  }
  
  console.log('Sample resources created successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
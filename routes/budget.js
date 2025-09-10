const express = require('express');
const router = express.Router();
const University = require('../models/University');
const Scholarship = require('../models/Scholarship');
const { auth } = require('../middleware/auth');

// POST /api/budget/calc - Calculate budget for selected universities
router.post('/calc', auth, async (req, res) => {
  try {
    const { universityIds, durationYears, scholarshipIds = [], currency = 'BDT' } = req.body;

    // Validate input
    if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'University IDs are required and must be an array'
      });
    }

    if (!durationYears || durationYears <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration in years is required and must be positive'
      });
    }

    // Fetch universities
    const universities = await University.find({
      _id: { $in: universityIds },
      isActive: true
    });

    if (universities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active universities found with provided IDs'
      });
    }

    // Fetch scholarships if provided
    let scholarships = [];
    if (scholarshipIds.length > 0) {
      scholarships = await Scholarship.find({
        _id: { $in: scholarshipIds },
        isActive: true
      });
    }

    // Calculate budget for each university
    const budgetCalculations = universities.map(university => {
      // Calculate tuition (use average of min/max for undergraduate)
      const tuitionPerYear = university.tuitionBDT?.undergraduate?.min && university.tuitionBDT?.undergraduate?.max
        ? (university.tuitionBDT.undergraduate.min + university.tuitionBDT.undergraduate.max) / 2
        : university.tuitionBDT?.undergraduate?.min || university.tuitionBDT?.undergraduate?.max || 0;
      
      const tuitionTotalBDT = tuitionPerYear * durationYears;

      // Calculate living cost (use annual if available, otherwise monthly * 12)
      let livingCostPerYear = 0;
      if (university.livingCostBDT?.annual?.min && university.livingCostBDT?.annual?.max) {
        livingCostPerYear = (university.livingCostBDT.annual.min + university.livingCostBDT.annual.max) / 2;
      } else if (university.livingCostBDT?.monthly?.min && university.livingCostBDT?.monthly?.max) {
        const monthlyAvg = (university.livingCostBDT.monthly.min + university.livingCostBDT.monthly.max) / 2;
        livingCostPerYear = monthlyAvg * 12;
      }
      
      const livingTotalBDT = livingCostPerYear * durationYears;

      // Get visa and other fees
      const visaFeeBDT = university.visaFeeBDT || 0;
      const otherFeesBDT = university.otherFeesBDT?.total || 0;

      // Calculate scholarship deduction for this university
      let scholarshipDeductionBDT = 0;
      scholarships.forEach(scholarship => {
        // Check if scholarship is applicable to this university
        if (!scholarship.eligibleUniversities || 
            scholarship.eligibleUniversities.length === 0 || 
            scholarship.eligibleUniversities.includes(university._id)) {
          
          if (scholarship.type === 'merit' || scholarship.type === 'need-based') {
            if (scholarship.coverageType === 'percentage') {
              // Apply percentage to tuition
              scholarshipDeductionBDT += (tuitionTotalBDT * scholarship.coveragePercentage) / 100;
            } else if (scholarship.coverageType === 'fixed') {
              // Add fixed amount (convert to BDT if needed)
              if (scholarship.currency === 'BDT') {
                scholarshipDeductionBDT += scholarship.amount || 0;
              } else {
                // Simple conversion rate (in real app, use live rates)
                const conversionRate = scholarship.currency === 'USD' ? 110 : 1;
                scholarshipDeductionBDT += (scholarship.amount || 0) * conversionRate;
              }
            }
          }
        }
      });

      // Calculate final cost
      const totalBeforeScholarship = tuitionTotalBDT + livingTotalBDT + visaFeeBDT + otherFeesBDT;
      const finalCostBDT = Math.max(0, totalBeforeScholarship - scholarshipDeductionBDT);

      return {
        universityId: university._id,
        university: university.name,
        country: university.country,
        city: university.city,
        durationYears,
        tuitionTotalBDT: Math.round(tuitionTotalBDT),
        livingTotalBDT: Math.round(livingTotalBDT),
        visaFeeBDT: Math.round(visaFeeBDT),
        otherFeesBDT: Math.round(otherFeesBDT),
        scholarshipDeductionBDT: Math.round(scholarshipDeductionBDT),
        totalBeforeScholarship: Math.round(totalBeforeScholarship),
        finalCostBDT: Math.round(finalCostBDT)
      };
    });

    // Sort by final cost (cheapest first)
    budgetCalculations.sort((a, b) => a.finalCostBDT - b.finalCostBDT);

    res.json({
      success: true,
      data: {
        calculations: budgetCalculations,
        summary: {
          totalUniversities: budgetCalculations.length,
          cheapestOption: budgetCalculations[0],
          averageCost: Math.round(
            budgetCalculations.reduce((sum, calc) => sum + calc.finalCostBDT, 0) / budgetCalculations.length
          ),
          totalScholarshipsApplied: scholarships.length
        }
      }
    });

  } catch (error) {
    console.error('Budget calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating budget',
      error: error.message
    });
  }
});

// GET /api/budget/universities - Get universities with budget data
router.get('/universities', async (req, res) => {
  try {
    const { country, minBudget, maxBudget, page = 1, limit = 20 } = req.query;
    
    const query = { isActive: true };
    
    if (country) {
      query.country = new RegExp(country, 'i');
    }

    // Build budget filter
    if (minBudget || maxBudget) {
      query.$or = [];
      
      if (minBudget) {
        query.$or.push({
          'tuitionBDT.undergraduate.min': { $gte: parseInt(minBudget) }
        });
      }
      
      if (maxBudget) {
        query.$or.push({
          'tuitionBDT.undergraduate.max': { $lte: parseInt(maxBudget) }
        });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const universities = await University.find(query)
      .select('name country city tuitionBDT livingCostBDT visaFeeBDT otherFeesBDT programs ranking')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'ranking.world': 1 });

    const total = await University.countDocuments(query);

    res.json({
      success: true,
      data: {
        universities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Budget universities fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching universities for budget planning',
      error: error.message
    });
  }
});

module.exports = router;
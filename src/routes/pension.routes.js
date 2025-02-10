const router = require('express').Router()
const HOC = require('../utils/hoc')
const PensionService = require('../services/pension.service')

// Unified Pension Dashboard API
router.get('/dashboard', 
  HOC.withAuth(['member', 'advisor']),
  async (req, res) => {
    const memberId = req.auth.sub
    const dashboardData = await PensionService.getMemberDashboard(memberId)
    res.json(dashboardData)
  }
)

// Contribution Projection API
router.post('/projections/contributions',
  HOC.withValidation(contributionSchema),
  HOC.withCache({ ttl: 3600 }),
  async (req, res) => {
    const projection = await PensionService.calculateContributionProjection(
      req.body.amount,
      req.body.frequency,
      req.body.retirementAge
    )
    res.json(projection)
  }
)

// Benefit Comparison API
router.get('/benefits/compare',
  HOC.withAuth(['member']),
  HOC.withRetry({ attempts: 3 }),
  async (req, res) => {
    const comparisons = await Promise.all([
      PensionService.getCurrentBenefit(),
      PensionService.getAlternativeScenario1(),
      PensionService.getAlternativeScenario2()
    ])
    res.json({
      current: comparisons[0],
      scenario1: comparisons[1],
      scenario2: comparisons[2]
    })
  }
) 
const { CustomHttpClient } = require('../utils/http')
const { cache } = require('../middleware/cache')

class PensionService {
  constructor() {
    this.memberClient = new CustomHttpClient(process.env.MEMBER_SERVICE_URL)
    this.calculationClient = new CustomHttpClient(process.env.CALCULATION_ENGINE_URL)
    this.paymentClient = new CustomHttpClient(process.env.PAYMENT_SERVICE_URL)
  }

  // Aggregate member dashboard data
  async getMemberDashboard(memberId) {
    const [profile, balance, projections] = await Promise.all([
      this.memberClient.get(`/members/${memberId}`),
      this.paymentClient.get(`/balances/${memberId}`),
      this.calculationClient.get(`/projections/${memberId}`)
    ])

    return {
      memberId: profile.id,
      currentBalance: balance.amount,
      retirementDate: profile.retirementDate,
      projectedMonthlyIncome: projections.monthlyIncome,
      contributionSummary: profile.contributionHistory
    }
  }

  // Complex calculation aggregation
  @cache({ ttl: 600 })
  async calculateContributionProjection(amount, frequency, retirementAge) {
    const [growthProjection, feeImpact] = await Promise.all([
      this.calculationClient.post('/projections/growth', {
        amount,
        frequency,
        years: retirementAge - currentAge
      }),
      this.calculationClient.post('/projections/fees', {
        amount,
        frequency
      })
    ])

    return {
      totalProjection: growthProjection.totalValue,
      feeImpact: feeImpact.totalFees,
      netValue: growthProjection.totalValue - feeImpact.totalFees
    }
  }

  // Benefit scenario comparison
  async getAlternativeScenario1() {
    return this.calculationClient.post('/scenarios/early-retirement', {
      reductionPercentage: 15
    })
  }
} 
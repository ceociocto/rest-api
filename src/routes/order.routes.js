const router = require('express').Router()
const HOC = require('../utils/hoc')
const OrderController = require('../controllers/order.controller')

// Composed HOC applications
const withOrderSecurity = HOC.withAuth(['admin', 'order_manager'])
const withAdvancedProtection = HOC.withCacheAndRateLimit({
  ttl: 60,
  windowMs: 15 * 60 * 1000,
  max: 100
})

// Create order (auth + cache + rate limit)
router.post(
  '/orders',
  withOrderSecurity(
    withAdvancedProtection(
      OrderController.createOrder
    )
  )
)

// Get order with error handling
router.get(
  '/orders/:id',
  HOC.withErrorHandling(
    OrderController.getOrder
  )
)

module.exports = router 
const router = require('express').Router()
const HOC = require('../utils/hoc')
const OrderController = require('../controllers/order.controller')

// 组合式HOC应用
const withOrderSecurity = HOC.withAuth(['admin', 'order_manager'])
const withAdvancedProtection = HOC.withCacheAndRateLimit({
  ttl: 60,
  windowMs: 15 * 60 * 1000,
  max: 100
})

// 创建订单（认证+缓存+限流）
router.post(
  '/orders',
  withOrderSecurity(
    withAdvancedProtection(
      OrderController.createOrder
    )
  )
)

// 查询订单（带错误处理）
router.get(
  '/orders/:id',
  HOC.withErrorHandling(
    OrderController.getOrder
  )
)

module.exports = router 
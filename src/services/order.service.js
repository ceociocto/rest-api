const { CustomHttpClient } = require('../utils/http')
const { cache } = require('../middleware/cache')

class OrderService {
  constructor() {
    this.inventoryClient = new CustomHttpClient(process.env.INVENTORY_SERVICE_URL)
    this.paymentClient = new CustomHttpClient(process.env.PAYMENT_SERVICE_URL)
  }

  // Composite order creation process
  async createOrder(orderData) {
    const [inventoryCheck, paymentAuth] = await Promise.all([
      this.inventoryClient.post('/stock/verify', {
        items: orderData.items
      }),
      this.paymentClient.post('/payments/pre-auth', {
        amount: orderData.totalAmount,
        cardToken: orderData.paymentToken
      })
    ])

    if (!inventoryCheck.success) {
      throw new Error('INVENTORY_CHECK_FAILED')
    }

    if (!paymentAuth.authorized) {
      throw new Error('PAYMENT_AUTH_FAILED')
    }

    // Call domain service to create order
    return this.domainClient.post('/orders', orderData)
  }

  // Cached order query with 60s TTL
  @cache({ ttl: 60 })
  async getOrder(orderId) {
    const [order, payment, logistics] = await Promise.all([
      this.domainClient.get(`/orders/${orderId}`),
      this.paymentClient.get(`/payments/order/${orderId}`),
      this.logisticsClient.get(`/tracking/${orderId}`)
    ])

    return {
      ...order,
      paymentStatus: payment.status,
      logisticsInfo: logistics
    }
  }
} 
const jwt = require('express-jwt')
const { ForbiddenError } = require('../utils/errors')

// JWT authentication
const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'auth'
})

// Role-based access control
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.auth.role)) {
    return next(new ForbiddenError('Insufficient permissions'))
  }
  next()
}

// API key validation
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.get('X-API-KEY')
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return next(new UnauthorizedError('Invalid API key'))
  }
  next()
}

// 客户端请求认证
const userAuth = jwt({
  secret: process.env.USER_JWT_SECRET,
  algorithms: ['HS256']
})

// 服务间认证
const serviceAuth = (req, res, next) => {
  const cert = req.get('X-Service-Cert')
  verifyServiceCertificate(cert) // 验证服务证书
  next()
}

// 混合认证模式
export const hybridAuth = (type) => {
  return (req, res, next) => {
    if (req.headers.authorization) {
      return userAuth(req, res, next)
    }
    if (req.headers['x-service-cert']) {
      return serviceAuth(req, res, next)
    }
    next(new AuthenticationError('Missing credentials'))
  }
}

module.exports = { authenticate, authorize, apiKeyAuth } 
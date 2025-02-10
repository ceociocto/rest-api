const jwt = require('express-jwt')
const { ForbiddenError } = require('../utils/errors')

// JWT认证
const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'auth'
})

// 权限控制
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.auth.role)) {
    return next(new ForbiddenError('Insufficient permissions'))
  }
  next()
}

// API密钥验证
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.get('X-API-KEY')
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return next(new UnauthorizedError('Invalid API key'))
  }
  next()
}

module.exports = { authenticate, authorize, apiKeyAuth } 
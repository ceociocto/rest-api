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

module.exports = { authenticate, authorize, apiKeyAuth } 
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const { apiLogger, errorHandler } = require('./middleware')
const routes = require('./routes')

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGINS.split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Request processing middleware
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(require('express-request-id')()) // Request ID tracking

// Logging middleware
app.use(apiLogger)

// API路由
app.use('/api/v1', routes)

// Health check endpoint
app.get('/health', (req, res) => res.json({ 
  status: 'UP',
  timestamp: new Date().toISOString()
}))

// Global error handling
app.use(errorHandler)

module.exports = app 
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const { apiLogger, errorHandler } = require('./middleware')
const routes = require('./routes')

const app = express()

// 安全中间件
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGINS.split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 请求处理中间件
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(require('express-request-id')()) // 请求ID追踪

// 日志中间件
app.use(apiLogger)

// API路由
app.use('/api/v1', routes)

// 健康检查端点
app.get('/health', (req, res) => res.json({ 
  status: 'UP',
  timestamp: new Date().toISOString()
}))

// 全局错误处理
app.use(errorHandler)

module.exports = app 
/**
 * HOC factory function
 * @param {Function[]} middlewares - Array of middleware functions
 * @returns {Function} Wrapped HOC
 */
const withMiddleware = (...middlewares) => (handler) => {
  return async (req, res, next) => {
    try {
      // Execute middlewares sequentially
      for (const middleware of middlewares) {
        await new Promise((resolve, reject) => {
          middleware(req, res, (err) => {
            err ? reject(err) : resolve()
          })
        })
      }
      // Execute main handler logic
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

// 常用HOC组合
const HOC = {
  // 错误处理封装
  withErrorHandling: (handler) => withMiddleware(errorHandlerWrapper)(handler),
  
  // 缓存+限流组合
  withCacheAndRateLimit: (options) => (handler) => 
    withMiddleware(
      cacheMiddleware(options),
      rateLimitMiddleware(options)
    )(handler),
  
  // 认证+授权组合
  withAuth(roles) {
    return (handler) => withMiddleware(
      authenticate,
      authorize(roles)
    )(handler)
  },

  // 在原有基础上增加参数校验HOC
  withValidation: (schema) => (handler) => {
    return async (req, res, next) => {
      try {
        const { error } = schema.validate(req.body)
        if (error) {
          throw new ValidationError(error.details)
        }
        return handler(req, res, next)
      } catch (err) {
        next(err)
      }
    }
  }
}

// 示例中间件实现
const errorHandlerWrapper = (req, res, next) => next()
const cacheMiddleware = ({ ttl }) => (req, res, next) => next()
const rateLimitMiddleware = ({ windowMs, max }) => (req, res, next) => next()

module.exports = HOC 
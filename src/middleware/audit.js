const auditLogger = new AuditLogService()

export const authAudit = (req, res, next) => {
  const start = Date.now()
  const { path, method } = req

  res.on('finish', () => {
    const auditEntry = {
      timestamp: new Date(),
      duration: Date.now() - start,
      status: res.statusCode,
      path,
      method,
      user: req.user?.id,
      service: req.service?.name
    }

    if (res.statusCode >= 400) {
      auditLogger.logSecurityIncident(auditEntry)
    }

    prometheus.collectAuthMetrics(auditEntry)
  })

  next()
} 
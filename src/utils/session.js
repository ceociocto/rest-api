class DistributedSession {
  constructor() {
    this.redis = new RedisCluster()
    this.localCache = new LRU({ max: 1000 })
  }

  async getSession(key) {
    const local = this.localCache.get(key)
    if (local) return local

    const remote = await this.redis.get(`session:${key}`)
    if (remote) {
      this.localCache.set(key, remote, 5000) // 5秒本地缓存
      return remote
    }

    return null
  }

  async refreshSession(key) {
    const newSession = generateSession()
    await this.redis.setex(`session:${key}`, 3600, newSession)
    this.localCache.delete(key)
    return newSession
  }
} 
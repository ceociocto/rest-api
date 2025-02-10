const refreshToken = async (oldToken) => {
  const { exp, refreshCount } = decodeToken(oldToken)
  
  // 阶梯式延长刷新周期
  const refreshWindow = Date.now() + 
    Math.min(3600 * 1000, (exp * 1000 - Date.now()) * 0.2)
  
  if (Date.now() > refreshWindow) {
    throw new Error('超出刷新窗口期')
  }

  // 刷新次数限制
  if (refreshCount >= 5) {
    await reAuthenticate()
  }

  return generateNewToken({ 
    ...decodeToken(oldToken),
    refreshCount: refreshCount + 1
  })
} 
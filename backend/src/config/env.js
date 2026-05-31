const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE', 'JWT_COOKIE_EXPIRE']

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((name) => !process.env[name])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
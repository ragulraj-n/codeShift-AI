export const TOKEN_CONFIG = {
  access: {
    secret: process.env.ACCESS_TOKEN_SECRET || 'access_secret_123_codeshift',
    expiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    // ✅ Cookie name for access token
    cookieName: 'accessToken',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      signed: true,
      path: '/',
      maxAge: 15 * 60 * 1000 // 15 minutes
    }
  },
  refresh: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_123_codeshift',
    expiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    cookieName: 'refreshToken',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      signed: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: process.env.COOKIE_DOMAIN || undefined
    }
  }
};

export default TOKEN_CONFIG;
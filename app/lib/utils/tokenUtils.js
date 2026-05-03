import jwt from 'jsonwebtoken';

/** Same value must be used for sign and verify when JWT_SECRET is unset (local dev only). */
const DEV_FALLBACK_JWT_SECRET =
  'dev-fallback-jwt-secret-super-secure-change-in-production';

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  console.warn(
    '⚠️ JWT_SECRET is not set; using dev fallback. Set JWT_SECRET in .env.local for production.'
  );
  return DEV_FALLBACK_JWT_SECRET;
}

export async function generateToken(user) {
  const payload = {
    id: user._id || user.id || user,
    fullName: user.fullName,
    role: user.role,
  };
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: '1d' });
}

export async function verifyToken(token) {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret);
  } catch (error) {
    console.log('Token verification failed:', error);
    return null;
  }
}

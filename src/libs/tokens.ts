import { randomUUIDv7 } from 'bun';
import { sign } from 'hono/jwt';
import { env } from '../config/env';
import type { UserRole } from './types';



export async function generateAccessToken(
  userId: string,
  role: UserRole
): Promise<string> {
  const payload = {
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 15,
  };

  const token = await sign(payload, env.JWT_ACCESS_SECRET);

  return token;
}

export async function generateRefreshToken(
  userId: string,
  role: UserRole,
  jti: string,
  expiresAt: number
): Promise<string> {
  const payload = {
    sub: userId,
    role,
    jti,
    exp: Math.floor(expiresAt / 1000),
  };

  const refreshToken = await sign(payload, env.JWT_REFRESH_SECRET);

  return refreshToken;
}

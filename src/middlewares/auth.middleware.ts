import type { Context, Next } from 'hono';
import { UnauthorizedException } from '../libs/errors';
import { verify } from 'hono/jwt';
import { env } from '../config/env';
import type { AccessTokenPayload } from '../libs/types';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Invalid Header');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedException('Not authenticated, please login');
  }

  try {
    const payload = await verify(token, env.JWT_ACCESS_SECRET!, 'HS256');
    c.set('user', payload as AccessTokenPayload);
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired session');
  }

  await next();
}

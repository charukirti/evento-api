import { Hono } from 'hono';
import { zValidator } from '../../libs/zvalidator';
import { loginSchema, registerSchema } from './auth.schema';
import { login, logout, register, refresh } from './auth.service';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { env } from '../../config/env';
import { UnauthorizedException } from '../../libs/errors';
import type { AppVariables } from '../../libs/types';

const authRouter = new Hono<{ Variables: AppVariables }>();

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json');

  const { user, accessToken, refreshToken, refreshExpiresAt } =
    await register(body);

  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'None' : 'Lax',
    expires: new Date(refreshExpiresAt),
  });

  return c.json(
    {
      success: true,
      message: 'User registered successfully',
      data: { user, accessToken },
    },
    201
  );
});

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');

  const { user, accessToken, refreshToken, refreshExpiresAt } =
    await login(body);

  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'None' : 'Lax',
    expires: new Date(refreshExpiresAt),
  });

  return c.json(
    {
      success: true,
      message: 'User logged in successfully',
      data: { user, accessToken },
    },
    200
  );
});

authRouter.post('/logout', async (c) => {
  const refreshToken = getCookie(c, 'refresh_token');

  if (!refreshToken) {
    throw new UnauthorizedException('Not authenticated');
  }

  await logout(refreshToken);

  deleteCookie(c, 'refresh_token', { path: '/auth/refresh' });

  return c.json({ success: true, message: 'Logged out successfully' }, 200);
});

authRouter.post('/refresh', async (c) => {
  const token = getCookie(c, 'refresh_token');

  if (!token) {
    throw new UnauthorizedException('Not authenticated');
  }

  const { accessToken, refreshToken, refreshExpiresAt } = await refresh(token);

  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'None' : 'Lax',
    expires: new Date(refreshExpiresAt),
  });

  return c.json({
    success: true,
    data: { accessToken },
  });
});

export default authRouter;

import { createMiddleware } from 'hono/factory';
import { ForbiddenException } from '../libs/errors';

export function requirePermission(permission: string) {
  return createMiddleware(async (c, next) => {
    const user = c.get('user');

    const hasPermission = user.permissions.includes(permission);

    if (!hasPermission) throw new ForbiddenException('Permission denied');

    await next();
  });
}

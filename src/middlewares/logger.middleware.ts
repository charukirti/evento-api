import { createMiddleware } from 'hono/factory';

export const customLogger = createMiddleware(async (c, next) => {
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  const time = new Date().toLocaleTimeString('en-US', { hour12: true });
  const symbol = c.res.status < 400 ? '✓' : '✗';

  console.log(
    `[${time}] ${symbol} ${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms`
  );
});

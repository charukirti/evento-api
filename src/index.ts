import { Hono } from 'hono';
import { errorHandler } from './middlewares/error-handler.middleware';
import { customLogger } from './middlewares/logger.middleware';

const app = new Hono();
app.use(customLogger);

app.get('/health', (c) => {
  return c.text('Hello Hono!');
});

app.notFound((c) => {
  return c.json({ error: `${c.req.path} not found` }, 404);
});

app.onError(errorHandler);

export default app;

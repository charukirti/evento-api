import type { ValidationTargets } from 'hono';
import type z from 'zod';
import { zValidator as ZV } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';

export function zValidator<
  T extends z.ZodType,
  Target extends keyof ValidationTargets,
>(target: Target, schema: T) {
  return ZV(target, schema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, { cause: result.error });
    }
  });
}

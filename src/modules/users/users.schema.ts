import z from 'zod';

export const deleteUserParamSchema = z.object({
  id: z.uuid({ error: 'invalid id' }),
});

export type DeleteUserParam = z.infer<typeof deleteUserParamSchema>;

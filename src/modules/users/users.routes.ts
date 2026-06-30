import { Hono } from 'hono';
import type { AppVariables } from '../../libs/types';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/requirePermission.middleware';
import { changeRole, deleteUser, getUser, getUsers } from './users.service';
import { zValidator } from '../../libs/zvalidator';
import { deleteUserParamSchema } from './users.schema';
import { deleteCookie } from 'hono/cookie';

const userRouter = new Hono<{ Variables: AppVariables }>();

// get users

userRouter.get(
  '/',
  authMiddleware,
  requirePermission('view:users'),
  async (c) => {
    const users = await getUsers();

    return c.json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  }
);

// get user

userRouter.get('/me', authMiddleware, async (c) => {
  const { sub } = c.get('user');

  const user = await getUser(sub);

  return c.json({
    success: true,
    message: 'User fetched successfully',
    data: user,
  });
});

// delete account

userRouter.delete('/me', authMiddleware, async (c) => {
  const { sub } = c.get('user');

  await deleteUser(sub);

  deleteCookie(c, 'refresh_token');

  return c.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// delete user

userRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('delete:user'),
  zValidator('param', deleteUserParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    await deleteUser(id);

    return c.json({
      success: true,
      message: 'User deleted successfully',
    });
  }
);

// change user role

userRouter.patch('/become-organizer', authMiddleware, async (c) => {
  const { sub } = c.get('user');

  const user = await changeRole(sub);

  return c.json({
    success: true,
    message: 'Role changed succcessfully',
    data: user,
  });
});

export default userRouter
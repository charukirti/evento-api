import { and, eq } from 'drizzle-orm';
import { db } from '../../db/db';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '../../libs/errors';
import { rolesTable, usersTable } from '../../db/schema';

export async function getUsers() {
  const users = await db.query.usersTable.findMany({
    columns: {
      password: false,
    },
  });

  return users;
}

export async function getUser(id: string) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
    columns: {
      password: false,
    },
  });

  if (!user) {
    throw new NotFoundException('User does not exist');
  }

  return user;
}

export async function deleteUser(id: string) {
  const [deletedUser] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
    });

  if (!deletedUser) {
    throw new NotFoundException('User already deleted');
  }
}

export async function changeRole(id: string) {
  const [existingUser] = await db
    .select({
      userId: usersTable.id,
      roleName: rolesTable.name,
    })
    .from(usersTable)
    .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
    .where(eq(usersTable.id, id));

  if (!existingUser) {
    throw new NotFoundException('user does not exist');
  }

  if (
    existingUser.roleName === 'organizer' ||
    existingUser.roleName === 'admin'
  ) {
    throw new BadRequestException('Role cannot be changed');
  }

  const roles = await db.query.rolesTable.findFirst({
    where: eq(rolesTable.name, 'organizer'),
  });

  if (!roles) {
    throw new InternalServerErrorException('Something went wrong');
  }

  const [user] = await db
    .update(usersTable)
    .set({ roleId: roles.id })
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      roleId: usersTable.roleId,
      createdAt: usersTable.createdAt,
    });

  if (!user) {
    throw new InternalServerErrorException('Unable to change role');
  }

  return user;
}

import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { usersTable } from '../../db/schema/users';
import type { LoginInput, RegisterInput } from './auth.schema';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '../../libs/errors';
import { generateAccessToken, generateRefreshToken } from '../../libs/tokens';
import { refreshTokenTable } from '../../db/schema/refresh-tokens';
import { randomUUIDv7 } from 'bun';
import { verify } from 'hono/jwt';
import { env } from '../../config/env';
import type { RefreshTokenPayload } from '../../libs/types';

export async function register(data: RegisterInput) {
  const { name, email, password } = data;

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existingUser) {
    throw new ConflictException('User already exist');
  }

  const hashedPassword = await Bun.password.hash(password);

  const jti = randomUUIDv7();
  const refreshExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  const user = await db.transaction(async (tx) => {
    const [insertedUser] = await tx
      .insert(usersTable)
      .values({ name, email, password: hashedPassword })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      });

    if (!insertedUser) {
      throw new InternalServerErrorException(
        'Unable to register user, please try again'
      );
    }

    await tx.insert(refreshTokenTable).values({
      jti,
      userId: insertedUser.id,
      expiresAt: new Date(refreshExpiresAt),
    });

    return insertedUser;
  });

  const accessToken = await generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(
    user.id,
    user.role,
    jti,
    refreshExpiresAt
  );

  return { user, accessToken, refreshToken,refreshExpiresAt };
}

export async function login(data: LoginInput) {
  const { email, password } = data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user) {
    throw new UnauthorizedException('Email or password does not match');
  }

  const isMatched = await Bun.password.verify(password, user.password);

  if (!isMatched) {
    throw new UnauthorizedException('Email or password does not match');
  }

  const jti = randomUUIDv7();
  const refreshExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  await db.insert(refreshTokenTable).values({
    jti,
    userId: user.id,
    expiresAt: new Date(refreshExpiresAt),
  });

  const accessToken = await generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(
    user.id,
    user.role,
    jti,
    refreshExpiresAt
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
    refreshExpiresAt
  };
}

export async function logout(refreshToken: string) {
  try {
    const decodedPayload = (await verify(
      refreshToken,
      env.JWT_REFRESH_SECRET,
      'HS256'
    )) as RefreshTokenPayload;

    const jti = decodedPayload.jti;

    await db.delete(refreshTokenTable).where(eq(refreshTokenTable.jti, jti));
  } catch (error) {
    console.error(
      'Logout token verification failed or token already expired:',
      error
    );
  }
}

export async function refresh(token: string) {
  const { sub, role, jti } = (await verify(
    token,
    env.JWT_REFRESH_SECRET,
    'HS256'
  )) as RefreshTokenPayload;

  const [existingJti] = await db
    .select()
    .from(refreshTokenTable)
    .where(eq(refreshTokenTable.jti, jti));

  if (!existingJti) {
    throw new UnauthorizedException('Not authenticated');
  }

  const newJti = randomUUIDv7();
  const refreshExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  await db.transaction(async (tx) => {
    await tx.delete(refreshTokenTable).where(eq(refreshTokenTable.jti, jti));

    await tx.insert(refreshTokenTable).values({
      jti: newJti,
      userId: sub,
      expiresAt: new Date(refreshExpiresAt),
    });
  });

  const accessToken = await generateAccessToken(sub, role);
  const newRefreshToken = await generateRefreshToken(
    sub,
    role,
    newJti,
    refreshExpiresAt
  );

  return { accessToken, refreshToken: newRefreshToken, refreshExpiresAt };
}

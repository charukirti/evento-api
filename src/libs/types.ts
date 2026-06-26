export type UserRole = 'organizer' | 'attendee';

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  exp: number;
};

export type RefreshTokenPayload = {
  sub: string;
  role: UserRole;
  jti: string;
  exp: number;
};


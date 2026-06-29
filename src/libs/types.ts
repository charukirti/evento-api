export type AccessTokenPayload = {
  sub: string;
  permissions: string[];
  exp: number;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
  exp: number;
};

export type AppVariables = {
  user: AccessTokenPayload;
};

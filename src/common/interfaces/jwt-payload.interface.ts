export interface JwtPayload {
  sub: number;
  email: string;
  first_name?: string;
  last_name?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  exp: number;
}

export interface DecodedToken {
  userId: string;
  role: number;
  nombre: string;
  exp: number;
}
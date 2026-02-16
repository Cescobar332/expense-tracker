export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');

export interface IRefreshTokenRepository {
  create(data: { userId: string; token: string; expiresAt: Date }): Promise<void>;
  findByToken(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: Date } | null>;
  deleteByToken(token: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
}

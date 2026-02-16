import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'dev-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  expiration: process.env.JWT_EXPIRATION || '15m',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}));

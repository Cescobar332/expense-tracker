import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, emailServiceMock } from './setup-app';
import { PrismaService } from './../src/shared/infrastructure/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user and send a verification email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).not.toHaveProperty('passwordHash');
        });

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      expect(user).not.toBeNull();
      expect(user?.firstName).toBe(testUser.firstName);
      expect(user?.lastName).toBe(testUser.lastName);
      expect(user?.isEmailVerified).toBe(false);
      expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should reject login before the email is verified', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect((res) => expect(res.status).toBeGreaterThanOrEqual(400));
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'weak@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      // First, manually verify the user for testing
      await prisma.user.update({
        where: { email: testUser.email },
        data: { isEmailVerified: true },
      });

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect((res.body as { user: { email: string } }).user.email).toBe(
            testUser.email,
          );
        });
    });

    it('should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password',
        })
        .expect(401);
    });
  });
});

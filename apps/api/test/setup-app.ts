import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { EmailService } from './../src/shared/services/email.service';

/** Correo falso: los tests nunca envían correos reales. */
export const emailServiceMock = {
  onModuleInit: jest.fn(),
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

/** Levanta la API igual que main.ts, pero lista para tests. */
export async function createTestApp(): Promise<INestApplication<App>> {
  if ((process.env.DATABASE_URL || '').includes('supabase')) {
    throw new Error(
      'Los tests e2e escriben en la base de datos: DATABASE_URL apunta a Supabase (producción). Usa la base local de Docker.',
    );
  }

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useValue(emailServiceMock)
    .compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Finance App API')
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.init();
  return app;
}

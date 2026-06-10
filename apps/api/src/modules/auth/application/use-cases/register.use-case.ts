import { Injectable, Inject, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../users/domain/repositories/user.repository.interface';
import {
  CATEGORY_REPOSITORY,
  ICategoryRepository,
} from '../../../categories/domain/repositories/category.repository.interface';
import {
  REFRESH_TOKEN_REPOSITORY,
  IRefreshTokenRepository,
} from '../../domain/repositories/refresh-token.repository.interface';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { hashPassword } from '../../../../shared/utils/hash.util';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { EmailService } from '../../../../shared/services/email.service';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.userRepository.create({
      email: normalizedEmail,
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      currency: dto.currency || 'USD',
    });

    await this.categoryRepository.createDefaultCategories(user.id);

    const verificationToken = randomUUID();
    const verificationExpiresAt = new Date(Date.now() + 24 * 3600000);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: verificationExpiresAt,
      },
    });

    this.emailService
      .sendVerificationEmail(user.email, verificationToken, user.language)
      .catch((err) =>
        this.logger.error(
          `Failed to send verification email to ${user.email}`,
          err,
        ),
      );

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = randomUUID();
    const refreshExpDays = Number.parseInt(
      this.configService
        .get<string>('jwt.refreshExpiration', '7')
        .replace('d', ''),
      10,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpDays);

    await this.refreshTokenRepo.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency,
        language: user.language,
      },
    };
  }
}

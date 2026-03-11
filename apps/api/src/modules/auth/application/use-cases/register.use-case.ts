import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../users/domain/repositories/user.repository.interface';
import {
  CATEGORY_REPOSITORY,
  ICategoryRepository,
} from '../../../categories/domain/repositories/category.repository.interface';
import { RegisterDto } from '../dto/register.dto';
import { hashPassword } from '../../../../shared/utils/hash.util';
import { User } from '../../../users/domain/entities/user.entity';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { EmailService } from '../../../../shared/services/email.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      currency: dto.currency || 'USD',
    });

    await this.categoryRepository.createDefaultCategories(user.id);

    const verificationToken = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 3600000); // 24 hours

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return user;
  }
}

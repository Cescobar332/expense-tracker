import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { CATEGORY_REPOSITORY, ICategoryRepository } from '../../../categories/domain/repositories/category.repository.interface';
import { RegisterDto } from '../dto/register.dto';
import { hashPassword } from '../../../../shared/utils/hash.util';
import { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categoryRepository: ICategoryRepository,
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

    return user;
  }
}

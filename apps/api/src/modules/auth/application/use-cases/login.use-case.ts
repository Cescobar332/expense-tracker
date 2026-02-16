import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { USER_REPOSITORY, IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { REFRESH_TOKEN_REPOSITORY, IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { comparePassword } from '../../../../shared/utils/hash.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    const refreshExpDays = parseInt(this.configService.get<string>('jwt.refreshExpiration', '7').replace('d', ''), 10);
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
      },
    };
  }
}

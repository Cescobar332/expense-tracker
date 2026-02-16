import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { USER_REPOSITORY, IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { REFRESH_TOKEN_REPOSITORY, IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(token: string): Promise<AuthResponseDto> {
    const storedToken = await this.refreshTokenRepo.findByToken(token);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) await this.refreshTokenRepo.deleteByToken(token);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o desactivado');
    }

    await this.refreshTokenRepo.deleteByToken(token);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const newRefreshToken = uuidv4();
    const refreshExpDays = parseInt(this.configService.get<string>('jwt.refreshExpiration', '7').replace('d', ''), 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpDays);

    await this.refreshTokenRepo.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
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

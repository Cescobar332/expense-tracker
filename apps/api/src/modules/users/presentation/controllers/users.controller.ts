import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(req.user.userId);
    if (!user) throw new Error('User not found');
    return UserResponseDto.fromEntity(user);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Actualizar perfil del usuario' })
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.update(req.user.userId, dto);
    return UserResponseDto.fromEntity(user);
  }
}

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { AuthResponseDto } from '../../application/dto/auth-response.dto';
import { UserResponseDto } from '../../../users/application/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    const user = await this.registerUseCase.execute(dto);
    return UserResponseDto.fromEntity(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens' })
  @ApiResponse({ status: 200, description: 'Tokens renovados' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }
}

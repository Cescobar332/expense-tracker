export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currency: string;
  createdAt: Date;

  static fromEntity(user: { id: string; email: string; firstName: string; lastName: string; currency: string; createdAt: Date }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.currency = user.currency;
    dto.createdAt = user.createdAt;
    return dto;
  }
}

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currency: string;
  language: string;
  createdAt: Date;

  static fromEntity(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    currency: string;
    language: string;
    createdAt: Date;
  }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.currency = user.currency;
    dto.language = user.language;
    dto.createdAt = user.createdAt;
    return dto;
  }
}

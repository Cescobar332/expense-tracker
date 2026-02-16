export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly currency: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.currency = props.currency;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

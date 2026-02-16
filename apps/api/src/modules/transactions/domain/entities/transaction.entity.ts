import { Decimal } from '@prisma/client/runtime/library';

export class Transaction {
  readonly id: string;
  readonly userId: string;
  readonly categoryId: string;
  readonly amount: Decimal;
  readonly type: string;
  readonly description: string | null;
  readonly date: Date;
  readonly isRecurring: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    categoryId: string;
    amount: Decimal;
    type: string;
    description: string | null;
    date: Date;
    isRecurring: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.type = props.type;
    this.description = props.description;
    this.date = props.date;
    this.isRecurring = props.isRecurring;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}

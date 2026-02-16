import { Decimal } from '@prisma/client/runtime/library';

export class SavingsGoal {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly targetAmount: Decimal;
  readonly currentAmount: Decimal;
  readonly targetDate: Date | null;
  readonly isCompleted: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    name: string;
    targetAmount: Decimal;
    currentAmount: Decimal;
    targetDate: Date | null;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.targetAmount = props.targetAmount;
    this.currentAmount = props.currentAmount;
    this.targetDate = props.targetDate;
    this.isCompleted = props.isCompleted;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get progress(): number {
    const target = Number(this.targetAmount);
    if (target <= 0) return 0;
    return Math.min(100, Math.round((Number(this.currentAmount) / target) * 100));
  }
}

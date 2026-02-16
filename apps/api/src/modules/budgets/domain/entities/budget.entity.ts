import { Decimal } from '@prisma/client/runtime/library';

export class Budget {
  readonly id: string;
  readonly userId: string;
  readonly categoryId: string;
  readonly amount: Decimal;
  readonly period: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly alertAt: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    categoryId: string;
    amount: Decimal;
    period: string;
    startDate: Date;
    endDate: Date;
    alertAt: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.period = props.period;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.alertAt = props.alertAt;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}

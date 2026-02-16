export class Category {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly type: string;
  readonly color: string;
  readonly icon: string | null;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    name: string;
    type: string;
    color: string;
    icon: string | null;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.type = props.type;
    this.color = props.color;
    this.icon = props.icon;
    this.isDefault = props.isDefault;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}

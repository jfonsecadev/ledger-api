import { Direction } from './Account';

export interface EntryProps {
  id: string;
  direction: Direction;
  amount: number;
  accountId: string;
}

export class Entry {
  private readonly _id: string;
  private readonly _direction: Direction;
  private readonly _amount: number;
  private readonly _accountId: string;

  constructor(props: EntryProps) {
    this._id = props.id;
    this._direction = props.direction;
    this._amount = props.amount;
    this._accountId = props.accountId;

    this.validate();
  }

  get id(): string {return this._id;}

  get direction(): Direction {return this._direction;}

  get amount(): number {return this._amount;}

  get accountId(): string {return this._accountId;}

  private validate(): void {
    if (this._amount <= 0) {throw new Error('Entry amount must be greater than 0');}
    if (!this._accountId) {throw new Error('Entry must have an account_id');}
    if (!['debit', 'credit'].includes(this._direction)) {throw new Error('Entry direction must be either debit or credit');}
  }

  static create(id: string, direction: Direction, amount: number, accountId: string): Entry {
    return new Entry({ id, direction, amount, accountId });
  }
}
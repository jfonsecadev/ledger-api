export type Direction = 'debit' | 'credit';

export interface AccountProps {
  id: string;
  name?: string;
  balance: number;
  direction: Direction;
}

export class Account {
  private readonly _id: string;
  private readonly _name?: string;
  private _balance: number;
  private readonly _direction: Direction;

  constructor(props: AccountProps) {
    this._id = props.id;
    this._name = props.name;
    this._balance = props.balance;
    this._direction = props.direction;
  }

  get id(): string {return this._id;}

  get name(): string | undefined {return this._name;}

  get balance(): number {return this._balance;}

  get direction(): Direction {return this._direction;}

  applyEntry(entryDirection: Direction, amount: number): void {
    if (this._direction === entryDirection) {this._balance += amount;}
    else {this._balance -= amount;}
  }

  static create(id: string, name: string | undefined, direction: Direction): Account {
    return new Account({id, name, balance: 0, direction});
  }
}
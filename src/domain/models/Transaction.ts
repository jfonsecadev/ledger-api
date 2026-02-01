import { Entry } from './Entry';

export interface TransactionProps {
  id: string;
  name?: string;
  entries: Entry[];
}

export class Transaction {
  private readonly _id: string;
  private readonly _name?: string;
  private readonly _entries: Entry[];

  constructor(props: TransactionProps) {
    this._id = props.id;
    this._name = props.name;
    this._entries = props.entries;
    this.validate();
  }

  get id(): string {return this._id;}

  get name(): string | undefined {return this._name;}

  get entries(): Entry[] {return [...this._entries];}

  private validate(): void {
    if (this._entries.length === 0) {
      throw new Error('Transaction must have at least one entry');
    }

    const totalDebits = this._entries
        .filter(entry => entry.direction === 'debit')
        .reduce((sum, entry) => sum + entry.amount, 0);

    const totalCredits = this._entries
        .filter(entry => entry.direction === 'credit')
        .reduce((sum, entry) => sum + entry.amount, 0);

    const epsilon = 0.01;
    if (Math.abs(totalDebits - totalCredits) > epsilon) {
      throw new Error(`Transaction entries must balance. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`);
    }
  }

  static create(id: string, name: string | undefined, entries: Entry[]): Transaction {
    return new Transaction({ id, name, entries });
  }
}
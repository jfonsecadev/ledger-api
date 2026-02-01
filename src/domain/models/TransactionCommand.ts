import { Direction } from './Account';

export interface EntryCommand {
    direction: Direction;
    amount: number;
    accountId: string;
}

export class TransactionCommand {
    constructor(
        public readonly name: string | undefined,
        public readonly entries: EntryCommand[]
    ) {
        this.validate();
    }

    private validate(): void {
        if (!this.entries || this.entries.length === 0) {throw new Error('Transaction must have at least one entry');}

        for (const entry of this.entries) {
            if (!['debit', 'credit'].includes(entry.direction)) {throw new Error('Entry direction must be either "debit" or "credit"');}
            if (!entry.amount || entry.amount <= 0) {throw new Error('Entry amount must be greater than 0');}
            if (!entry.accountId) {throw new Error('Entry must have an accountId');}
        }

        const totalDebits = this.entries
            .filter(e => e.direction === 'debit')
            .reduce((sum, e) => sum + e.amount, 0);

        const totalCredits = this.entries
            .filter(e => e.direction === 'credit')
            .reduce((sum, e) => sum + e.amount, 0);

        const epsilon = 0.01;
        if (Math.abs(totalDebits - totalCredits) > epsilon) {
            throw new Error(`Transaction entries must balance. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`);
        }
    }
}
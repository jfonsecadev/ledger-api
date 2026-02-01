import { Direction } from './Account';

export class AccountCommand {
    constructor(
        public readonly name: string | undefined,
        public readonly direction: Direction
    ) {
        this.validate();
    }

    private validate(): void {
        if (!['debit', 'credit'].includes(this.direction)) {throw new Error('Account direction must be either "debit" or "credit"');}
    }
}
import { Transaction } from '../models/Transaction';
import { Entry } from '../models/Entry';
import { TransactionCommand } from '../models/TransactionCommand';
import { TransactionRepository } from '../repositories';
import { AccountRepository } from '../repositories';
import { v4 as uuid4 } from 'uuid';

export class LedgerService {
  constructor(
      private readonly transactionRepository: TransactionRepository,
      private readonly accountRepository: AccountRepository
  ) {}

  async handle(command: TransactionCommand, transactionId?: string): Promise<Transaction> {
    const accountIds = command.entries.map(e => e.accountId);
    for (const accountId of accountIds) {
      if (!this.accountRepository.exists(accountId)) {
        throw new Error(`Account not found: ${accountId}`);
      }
    }

    const entries = command.entries.map(entryCommand =>
        Entry.create(
            uuid4(),
            entryCommand.direction,
            entryCommand.amount,
            entryCommand.accountId
        )
    );

    const transaction = Transaction.create(
        transactionId || uuid4(),
        command.name,
        entries
    );

    await this.applyEntriesToAccounts(entries);
    return this.transactionRepository.save(transaction);
  }

  private async applyEntriesToAccounts(entries: Entry[]): Promise<void> {
    const updates = entries.map(entry => ({
      accountId: entry.accountId,
      updateFn: (account: any) => {
        account.applyEntry(entry.direction, entry.amount);
      }
    }));

    await this.accountRepository.updateMultiple(updates);
  }
}
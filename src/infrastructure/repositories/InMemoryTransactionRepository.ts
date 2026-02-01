import { Transaction } from '../../domain';
import { TransactionRepository } from '../../domain/repositories';
import { Entry } from '../../domain';

export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  save(transaction: Transaction): Transaction {
    const entriesCopy = transaction.entries.map(entry =>
        Entry.create(entry.id, entry.direction, entry.amount, entry.accountId)
    );

    const transactionCopy = Transaction.create(
        transaction.id,
        transaction.name,
        entriesCopy
    );

    this.transactions.set(transaction.id, transactionCopy);
    return transactionCopy;
  }

  findById(id: string): Transaction | undefined {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      return undefined;
    }

    const entriesCopy = transaction.entries.map(entry =>
        Entry.create(entry.id, entry.direction, entry.amount, entry.accountId)
    );

    return Transaction.create(
        transaction.id,
        transaction.name,
        entriesCopy
    );
  }
}
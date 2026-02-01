import { Account } from '../../domain';
import { AccountRepository } from '../../domain/repositories';

export class InMemoryAccountRepository implements AccountRepository {
  private accounts: Map<string, Account> = new Map();
  private locks: Map<string, Promise<void>> = new Map();

  private async acquireLock(accountId: string): Promise<() => void> {
    while (this.locks.has(accountId)) {
      await this.locks.get(accountId);
    }
    let releaseLock: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    this.locks.set(accountId, lockPromise);
    return () => {
      this.locks.delete(accountId);
      releaseLock!();
    };
  }

  save(account: Account): Account {
    const accountCopy = new Account({
      id: account.id,
      name: account.name,
      balance: account.balance,
      direction: account.direction
    });

    this.accounts.set(account.id, accountCopy);
    return accountCopy;
  }

  findById(id: string): Account | undefined {
    const account = this.accounts.get(id);
    if (!account) {return undefined;}

    return new Account({
      id: account.id,
      name: account.name,
      balance: account.balance,
      direction: account.direction
    });
  }

  exists(id: string): boolean {
    return this.accounts.has(id);
  }
  async updateMultiple(
      updates: Array<{ accountId: string; updateFn: (account: Account) => void }>
  ): Promise<Account[]> {
    const uniqueAccountIds = [...new Set(updates.map(u => u.accountId))];
    const sortedAccountIds = uniqueAccountIds.sort();
    const releaseFunctions: Array<() => void> = [];

    try {
      for (const accountId of sortedAccountIds) {
        const releaseLock = await this.acquireLock(accountId);
        releaseFunctions.push(releaseLock);
      }

      for (const accountId of sortedAccountIds) {
        if (!this.accounts.get(accountId)) {
          throw new Error(`Account not found: ${accountId}`);
        }
      }

      const updatedAccounts: Account[] = [];
      for (const update of updates) {
        const account = this.accounts.get(update.accountId)!;
        update.updateFn(account);

        if (!updatedAccounts.find(a => a.id === account.id)) {updatedAccounts.push(account);}
      }

      for (const account of updatedAccounts) {this.save(account);}

      return updatedAccounts;
    } catch (error) {
      throw error;
    } finally {
      releaseFunctions.reverse().forEach(release => release());
    }
  }
}
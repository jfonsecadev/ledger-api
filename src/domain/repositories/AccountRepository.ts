import { Account } from '../index';

export interface AccountRepository {
  save(account: Account): Account;
  findById(id: string): Account | undefined;
  exists(id: string): boolean;
  updateMultiple(updates: Array<{ accountId: string; updateFn: (account: Account) => void }>): Promise<Account[]>;
}
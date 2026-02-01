import { Account } from '../index';
import { AccountCommand } from '../models/AccountCommand';
import { AccountRepository } from '../repositories';
import { v4 as uuidv4 } from 'uuid';

export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  handle(command: AccountCommand): Account {
    console.log("Creating account with command", command);
    const accountId = uuidv4();

    if (this.accountRepository.exists(accountId)) {
      throw new Error(`Account with ID ${accountId} already exists`);
    }

    const account = Account.create(accountId, command.name, command.direction);

    this.accountRepository.save(account);

    return account;
  }
}
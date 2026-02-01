import { AccountRepository } from '../../domain/repositories';
import { CreateAccountResponse } from '../response/CreateAccountResponse';

class GetAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  execute(accountId: string): CreateAccountResponse {
    console.log('GetAccountUseCase.execute', accountId);

    const account = this.accountRepository.findById(accountId);

    if (!account) {throw new Error(`Account not found: ${accountId}`);}

    return {
      id: account.id,
      name: account.name,
      balance: account.balance,
      direction: account.direction
    };
  }
}

export default GetAccountUseCase;
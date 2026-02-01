import { LedgerService } from '../../domain/services';
import { CreateTransactionRequest } from '../request/CreateTransactionRequest';
import { CreateTransactionResponse } from '../response/CreateTransactionResponse';
import { TransactionCommand } from '../../domain/models/TransactionCommand';

class CreateTransactionUseCase {
  constructor(private readonly ledgerService: LedgerService) {}

  async execute(request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    console.log('CreateTransactionUseCase.execute', request);

    const commandEntries = request.entries.map(entry => ({
      direction: entry.direction,
      amount: entry.amount,
      accountId: entry.account_id
    }));

    const command = new TransactionCommand(request.name, commandEntries);
    const transaction = await this.ledgerService.handle(command, request.id);

    return {
      id: transaction.id,
      name: transaction.name,
      entries: transaction.entries.map(entry => ({
        id: entry.id,
        direction: entry.direction,
        amount: entry.amount,
        account_id: entry.accountId
      }))
    };
  }
}

export default CreateTransactionUseCase;
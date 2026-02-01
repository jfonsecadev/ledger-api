import {
  InMemoryAccountRepository,
  InMemoryTransactionRepository
} from '../repositories';

import {
  AccountController,
  TransactionController
} from '../http/controllers';

import {
  AccountService, LedgerService
} from '../../domain/services';
import CreateAccountUseCase from "../../application/use-cases/CreateAccountUseCase";
import GetAccountUseCase from "../../application/use-cases/GetAccountUseCase";
import CreateTransactionUseCase from "../../application/use-cases/CreateTransactionUseCase";


export class Container {
  private readonly accountRepository: InMemoryAccountRepository;
  private readonly transactionRepository: InMemoryTransactionRepository;
  private readonly accountService: AccountService;
  private readonly ledgerService: LedgerService;
  private readonly createAccountUseCase: CreateAccountUseCase;
  private readonly getAccountUseCase: GetAccountUseCase;
  private readonly createTransactionUseCase: CreateTransactionUseCase;
  private readonly accountController: AccountController;
  private readonly transactionController: TransactionController;

  constructor() {
    this.accountRepository = new InMemoryAccountRepository();
    this.transactionRepository = new InMemoryTransactionRepository();
    this.accountService = new AccountService(this.accountRepository);
    this.ledgerService = new LedgerService(
        this.transactionRepository,
        this.accountRepository
    );
    this.createAccountUseCase = new CreateAccountUseCase(this.accountService);
    this.getAccountUseCase = new GetAccountUseCase(this.accountRepository);
    this.createTransactionUseCase = new CreateTransactionUseCase(this.ledgerService);
    this.accountController = new AccountController(
        this.createAccountUseCase,
        this.getAccountUseCase
    );

    this.transactionController = new TransactionController(
        this.createTransactionUseCase
    );
  }

  getAccountController(): AccountController {
    return this.accountController;
  }

  getTransactionController(): TransactionController {
    return this.transactionController;
  }
}
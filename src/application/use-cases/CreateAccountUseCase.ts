import { AccountService } from '../../domain/services';
import {CreateAccountRequest} from "../request/CreateAccountRequest";
import {CreateAccountResponse} from "../response/CreateAccountResponse";
import {AccountCommand} from "../../domain/models/AccountCommand";

class CreateAccountUseCase {
  constructor(private readonly accountService: AccountService) {}

  execute(request: CreateAccountRequest): CreateAccountResponse {
    console.log("CreateAccountUseCase.execute", request);

    const command = new AccountCommand(request.name, request.direction);
    const account = this.accountService.handle(command);

    return {
      id: account.id,
      name: account.name,
      balance: account.balance,
      direction: account.direction
    };
  }
}

export default CreateAccountUseCase;
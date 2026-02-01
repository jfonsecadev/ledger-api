import { Request, Response } from 'express';
import CreateAccountUseCase from "../../../application/use-cases/CreateAccountUseCase";
import GetAccountUseCase from "../../../application/use-cases/GetAccountUseCase";

export class AccountController {
  constructor(
      private readonly createAccountUseCase: CreateAccountUseCase,
      private readonly getAccountUseCase: GetAccountUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const response = this.createAccountUseCase.execute(req.body);
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating account:', error);
      if (error instanceof Error) {
        res.status(400).json({error: error.message});
      } else {
        res.status(500).json({error: 'Internal server error'});
      }
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const accountId = req.params.id;
      const response = this.getAccountUseCase.execute(accountId);
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting account:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({error: error.message});
      } else if (error instanceof Error) {
        res.status(400).json({error: error.message});
      } else {
        res.status(500).json({error: 'Internal server error'});
      }
    }
  }
}
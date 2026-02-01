import { Request, Response } from 'express';
import CreateTransactionUseCase from "../../../application/use-cases/CreateTransactionUseCase";

export class TransactionController {
  constructor(
      private readonly createTransactionUseCase: CreateTransactionUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.createTransactionUseCase.execute(req.body);
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating transaction:', error);

      if (error instanceof Error) {
        if (error.message.includes('not found')) {res.status(404).json({error: error.message});
        } else if (
            error.message.includes('balance') ||
            error.message.includes('must have at least one entry') ||
            error.message.includes('direction must be')) {
          res.status(400).json({error: error.message});
        } else {
          res.status(400).json({error: error.message});
        }
      } else {
        res.status(500).json({error: 'Internal server error'});
      }
    }
  }
}
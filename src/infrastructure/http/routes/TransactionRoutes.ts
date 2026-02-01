import { Router } from 'express';
import { TransactionController } from '../controllers';

export function createTransactionRoutes(transactionController: TransactionController): Router {
  const router = Router();

  router.post('/', (req, res) => {
    transactionController.create(req, res);
  });

  return router;
}
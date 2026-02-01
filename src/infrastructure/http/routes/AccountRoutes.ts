import { Router } from 'express';
import { AccountController } from '../controllers';

export function createAccountRoutes(accountController: AccountController): Router {
  const router = Router();
  router.post('/', (req, res) => {
    accountController.create(req, res);
  });

  router.get('/:id', (req, res) => {
    accountController.getById(req, res);
  });

  return router;
}
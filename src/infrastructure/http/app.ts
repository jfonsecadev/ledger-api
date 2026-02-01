import express, { Application, Request, Response, NextFunction } from 'express';
import { Container } from '../di/Container';
import { createAccountRoutes, createTransactionRoutes } from './routes';

export function createApp(): Application {
  const app = express();
  const container = new Container();
  app.use(express.json());
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({status: 'UP', timestamp: new Date().toISOString()});
  });

  app.use('/accounts', createAccountRoutes(container.getAccountController()));
  app.use('/transactions', createTransactionRoutes(container.getTransactionController()));
  app.use((req: Request, res: Response) => {
    res.status(404).json({error: 'Not Found', message: `Route ${req.method} ${req.path} not found`});
  });

  app.use((err: Error, _req: Request, res: Response) => {
    console.error('Unhandled error:', err);
    res.status(500).json({error: 'Internal Server Error', message: err.message || 'An unexpected error occurred'});
  });

  return app;
}
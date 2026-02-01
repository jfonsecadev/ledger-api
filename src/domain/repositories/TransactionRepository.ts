import { Transaction } from '../models/Transaction';

export interface TransactionRepository {
  save(transaction: Transaction): Transaction;
  findById(id: string): Transaction | undefined;
}
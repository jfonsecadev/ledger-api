import { Direction } from './Direction';

export interface EntryRequest {
    direction: Direction;
    amount: number;
    account_id: string;
}

export interface CreateTransactionRequest {
    id?: string;
    name?: string;
    entries: EntryRequest[];
}
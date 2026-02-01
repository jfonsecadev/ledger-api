import { Direction } from '../request/Direction';

export interface EntryResponse {
    id: string;
    direction: Direction;
    amount: number;
    account_id: string;
}

export interface CreateTransactionResponse {
    id: string;
    name?: string;
    entries: EntryResponse[];
}
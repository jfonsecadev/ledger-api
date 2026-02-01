import {Direction} from "../request/Direction";

export interface CreateAccountResponse {
    id: string;
    name?: string;
    balance: number;
    direction: Direction;
}
import {Direction} from "./Direction";

export interface CreateAccountRequest {
    name?: string;
    direction: Direction;
}
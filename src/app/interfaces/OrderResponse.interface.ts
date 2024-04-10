import { Order } from "./Order.interface";

export interface OrderResponse {
    query: string;
    results: Order[];
  }
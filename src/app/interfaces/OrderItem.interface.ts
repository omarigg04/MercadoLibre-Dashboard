import { Item } from "./Item.interface";

export interface OrderItem {
    item: Item;
    quantity: number;
    unit_price: number;
    full_unit_price: number;
    currency_id: string;
    manufacturing_days: number | null;
    picked_quantity: number | null;
    requested_quantity: {
      measure: string;
      value: number;
    };
    sale_fee: number;
    listing_type_id: string;
    base_exchange_rate: number | null;
    base_currency_id: string | null;
    bundle: any; // Podrías especificar la estructura exacta si es conocida
    element_id: number;
  }
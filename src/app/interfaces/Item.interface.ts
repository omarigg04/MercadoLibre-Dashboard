export interface Item {
    id: string;
    title: string;
    category_id: string;
    variation_id: string | null;
    seller_custom_field: string | null;
    global_price: number | null;
    net_weight: number | null;
    variation_attributes: any[]; // Podrías especificar la estructura exacta si es conocida
    warranty: string;
    condition: string;
    seller_sku: string | null;
  }
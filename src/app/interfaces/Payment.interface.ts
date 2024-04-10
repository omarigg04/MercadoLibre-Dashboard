export interface Payment {
    reason: string;
    status_code: string | null;
    total_paid_amount: number;
    operation_type: string;
    transaction_amount: number;
    transaction_amount_refunded: number;
    date_approved: string;
    collector: {
      id: number;
    };
    coupon_id: number | null;
    installments: number;
    authorization_code: string | null;
    taxes_amount: number;
    id: number;
    date_last_modified: string;
    coupon_amount: number;
    available_actions: string[];
    shipping_cost: number;
    installment_amount: number | null;
    date_created: string;
    activation_uri: string | null;
    overpaid_amount: number;
    card_id: number | null;
    status_detail: string;
    issuer_id: string | null;
    payment_method_id: string;
    payment_type: string;
    deferred_period: number | null;
    atm_transfer_reference: {
      transaction_id: string | null;
      company_id: string | null;
    };
    site_id: string;
    payer_id: number;
    order_id: number;
    currency_id: string;
    status: string;
    transaction_order_id: string | null;
  }
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { GridOptions, RowModelType } from 'ag-grid-community';

interface Payment {
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

interface Item {
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

interface OrderItem {
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

interface Buyer {
  id: number;
  nickname: string;
}

interface Seller {
  id: number;
  nickname: string;
}

interface Order {
  payments: Payment[];
  fulfilled: boolean;
  taxes: {
    amount: number | null;
    currency_id: string | null;
    id: number | null;
  };
  order_request: {
    change: any; // Podrías especificar la estructura exacta si es conocida
    return: any; // Podrías especificar la estructura exacta si es conocida
  };
  expiration_date: string;
  feedback: {
    buyer: any; // Podrías especificar la estructura exacta si es conocida
    seller: any; // Podrías especificar la estructura exacta si es conocida
  };
  shipping: {
    id: number;
  };
  date_closed: string;
  id: number;
  manufacturing_ending_date: string | null;
  order_items: OrderItem[];
  date_last_updated: string;
  last_updated: string;
  comment: string | null;
  pack_id: number | null;
  coupon: {
    amount: number;
    id: number | null;
  };
  shipping_cost: number | null;
  date_created: string;
  pickup_id: any; // Podrías especificar la estructura exacta si es conocida
  status_detail: string | null;
  tags: string[];
  buyer: Buyer;
  seller: Seller;
  total_amount: number;
  paid_amount: number;
  currency_id: string;
  status: string;
  context: {
    application: any; // Podrías especificar la estructura exacta si es conocida
    product_id: any; // Podrías especificar la estructura exacta si es conocida
    channel: string;
    site: string;
    flows: any[]; // Podrías especificar la estructura exacta si es conocida
  };
}

interface OrderResponse {
  query: string;
  results: Order[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})


export class DashboardComponent implements OnInit {

  response: Order | null = null;
  orders: any[] = [];
  columnDefs: any[] = [];
  rowData: any[] = [];
  gridOptions: any;


  onGridReady(params: any) {
    params.api.showLoadingOverlay(); // Esto muestra el overlay de carga cuando la tabla está lista
  }


  constructor(private http: HttpClient) {
    
    this.columnDefs = [
      {headerName: 'Order ID', field: 'id', sortable: true, filter: true, editable: true },
      {headerName: 'Created', field: 'date_created', sortable: true, filter: true, editable: true  },
      {headerName: 'Raw Total', field: 'paid_amount', sortable: true, filter: true, editable: true  },
      {headerName: 'Product Fee', field: 'sale_fee', sortable: true, filter: true, editable: true  },

      // Aquí puedes definir las demás columnas
      // Por ejemplo: { headerName: 'Nombre', field: 'nombre' }
    ];
  }

  ngOnInit(): void {
    this.http.get<Order[]>('http://localhost:3000/api/orders').subscribe(
      (response: Order[]) => {
        this.rowData = response.map(order => ({
          id: order.id,
          date_created: order.date_created,
          paid_amount: order.paid_amount,
          sale_fee: order.order_items[0].sale_fee
      
          // Aquí puedes asignar otras propiedades de la orden según sea necesario
        }));

        console.log(response); // Esto imprimirá todas las órdenes en la consola
      },
      (error) => {
        console.error('Error al obtener pedidos:', error);
      }
    );
  }

}

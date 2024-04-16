import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { GridOptions, RowModelType } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { Order } from '../interfaces/Order.interface';
import { ValueFormatterParams } from 'ag-grid-community';
import { environment } from '../../environments/environment'; 




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
  isLoading: boolean = true;


  onGridReady(params: any) {
    params.api.showLoadingOverlay(); // Esto muestra el overlay de carga cuando la tabla está lista
  }


  constructor(private http: HttpClient, private datePipe: DatePipe) {
    
    this.columnDefs = [
      {
        headerName: 'Order ID',
        field: 'id',
        sortable: true,
        filter: true,
        editable: true,
      },
      {
        headerName: 'Created',
        field: 'date_created',
        filter: "agDateColumnFilter",
        sortable: true,
        editable: true,
        // Usa valueFormatter para mostrar la fecha en el formato deseado
        valueFormatter: (params:ValueFormatterParams) => this.datePipe.transform(params.value, 'dd/MM/yyyy, HH:mm'),
      },      
      {
        headerName: 'Header Product',
        field: 'item',
        sortable: true,
        filter: true,
        editable: true,
        width: 500,
      },
      {
        headerName: 'Raw Total',
        field: 'total_amount',
        sortable: true,
        filter: true,
        editable: true,
        valueFormatter: this.formatCurrency.bind(this),
        width: 120,
      },
      {
        headerName: 'ML Fee',
        field: 'sale_fee',
        sortable: true,
        filter: true,
        editable: true,
        valueFormatter: this.formatCurrency.bind(this),
        width: 120,
      },
      {
        headerName: 'SAT Fee',
        field: 'sat_fee',
        sortable: true,
        filter: true,
        editable: true,
        valueFormatter: this.formatCurrency.bind(this),
        width: 120,
      },

      // Aquí puedes definir las demás columnas
      // Por ejemplo: { headerName: 'Nombre', field: 'nombre' }
    ];
  }

  ngOnInit(): void {
    this.http.get<Order[]>(`${environment.apiUrl}/api/orders`).subscribe(
      (response: Order[]) => {
        // Primero, filtramos los pedidos para quedarnos solo con aquellos cumplidos
        const fulfilledOrders = response.filter(order => order.fulfilled);
  
        // Luego, mapeamos esos pedidos a la estructura deseada
        this.rowData = fulfilledOrders.map(order => ({
          id: order.id,
          // Ajustamos date_created para que la hora sea medianoche
          date_created: new Date(new Date(order.date_created).setHours(0, 0, 0, 0)),
          total_amount: order.total_amount,
          sale_fee: order.order_items[0].sale_fee,
          item: order.order_items[0].item.title,
          sat_fee: order.total_amount * 0.01 + order.total_amount * 0.08
        }));
        this.isLoading = false;
        console.log(fulfilledOrders); // Esto imprimirá todas las órdenes cumplidas en la consola
      },
      (error) => {
        console.error('Error al obtener pedidos:', error);
      }
    );
  }
  
  
  

  formatCurrency(params: any) {
    return `$${params.value.toFixed(2)}`;
  }

}

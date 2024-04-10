import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { GridOptions, RowModelType } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { Order } from '../interfaces/Order.interface';
import { AgChartsAngular } from "ag-charts-angular";
import { AgChartOptions, AgCharts } from "ag-charts-community";

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
        sortable: true,
        filter: true,
        editable: true,
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
        field: 'paid_amount',
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
    this.http.get<Order[]>('http://localhost:3000/api/orders').subscribe(
      (response: Order[]) => {
        this.rowData = response.map(order => ({
          id: order.id,
          date_created: this.datePipe.transform(order.date_created, 'dd/MM/yyyy, HH:mm'),
          paid_amount: order.paid_amount,
          sale_fee: order.order_items[0].sale_fee,
          item: order.order_items[0].item.title,
          sat_fee: order.paid_amount * 0.01 + order.paid_amount * 0.08
      
          // Aquí puedes asignar otras propiedades de la orden según sea necesario
        }));

        console.log(response); // Esto imprimirá todas las órdenes en la consola
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

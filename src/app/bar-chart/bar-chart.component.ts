import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Order } from '../interfaces/Order.interface';
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap, tap, } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
  isLoading: boolean = true;
  totalSumIsLoading: boolean = true;
  enviosIsLoading: boolean = true;
  feesIsLoading: boolean = true;
  satSumIsLoading: boolean = true;
  realSumIsLoading: boolean = true;


  public totalSum: number = 0;
  public envios: number = 0;
  public fees: number = 0;
  public satSum: number = 0;
  public realSum: number = 0;
  public options: any = {};
  public chartData: any[] = [];
  public filteredChartData: any[] = [];
  public ordersWithShippingCost: Order[] = []; // Asegúrate de que se actualice correctamente
  dateRangeForm: FormGroup;

  constructor(private http: HttpClient, private datePipe: DatePipe, private authService: AuthService) {
    this.dateRangeForm = new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
    });
  }

ngOnInit(): void {
  this.http.get<Order[]>('http://localhost:3000/api/orders').pipe(
    map(orders => orders.filter(order => order.fulfilled)), // Filtra las órdenes cumplidas
    mergeMap(fulfilledOrders => {
      this.chartData = fulfilledOrders.map(order => {
        const date = new Date(order.date_created);
        const saleFee = order.order_items.reduce((sum, item) => sum + item.sale_fee, 0); // Suma los sale_fee de los ítems de cada orden

        return { date, total_amount: order.total_amount, saleFee };
      });

      // Obtener los costos de envío de todas las órdenes cumplidas
      const shipmentCostRequests = fulfilledOrders.map(order =>
        this.http.get<{ listCost: number }>(`http://localhost:3000/api/shipments/${order.shipping.id}`).pipe(
          catchError(() => of({ listCost: 0 })) // Manejo de error para costos de envío, asumiendo 0 si hay error
        )
      );

      return forkJoin(shipmentCostRequests).pipe(
        map(listCosts => {
          return fulfilledOrders.map((order, index) => ({
            ...order,
            listCost: listCosts[index].listCost
          }));
        })
      );
    })
  ).subscribe(ordersWithShippingCost => {
    this.ordersWithShippingCost = ordersWithShippingCost;
    this.envios = ordersWithShippingCost.reduce((acc, order) => acc + order.listCost, 0);
    this.filteredChartData = this.chartData; // Asegúrate de que los datos filtrados inicialmente sean todo el conjunto de datos
    this.updateChart();
    this.isLoading = false;
    this.enviosIsLoading = false;
  }, error => {
    console.error('Error al obtener pedidos:', error);
    this.isLoading = false;
  });
}


  applyFilter() {
    const { start, end } = this.dateRangeForm.value;
    if (start && end) {
      const inclusiveEnd = new Date(end);
      inclusiveEnd.setDate(inclusiveEnd.getDate() + 1);
  
      const dateFilteredData = this.chartData.filter((data) => {
        const dataDate = new Date(data.date);
        return dataDate >= new Date(start) && dataDate < inclusiveEnd;
      });
  
      const dateFilteredOrders = this.ordersWithShippingCost.filter((order) => {
        const orderDate = new Date(order.date_created);
        return orderDate >= new Date(start) && orderDate < inclusiveEnd;
      });

      this.filteredChartData = this.aggregateDataByDate(dateFilteredData);
      this.updateChart(dateFilteredOrders); // Asegúrate de pasar las órdenes filtradas
    }
  }

  private aggregateDataByDate(data: any[]): any[] {
    const aggregatedData = new Map<string, { total_amount: number, sale_fee: number }>();
  
    data.forEach(({ date, total_amount, sale_fee }) => { // Asegúrate de que sale_fee está siendo pasado correctamente
      const dateKey = this.datePipe.transform(date, 'MM-dd-yyyy');
      if (!dateKey) return;
  
      if (aggregatedData.has(dateKey)) {
        const existing = aggregatedData.get(dateKey)!;
        existing.total_amount += total_amount;
        existing.sale_fee += sale_fee;  // Ahora sale_fee es accedido correctamente
      } else {
        aggregatedData.set(dateKey, { total_amount: total_amount, sale_fee: sale_fee });  // Inicializa correctamente sale_fee
      }
    });
  
    // Convertir el mapa de vuelta a un arreglo de objetos para el gráfico
    return Array.from(aggregatedData, ([date, { total_amount, sale_fee }]) => ({
      date: new Date(date),  // Convertir la cadena de vuelta a una fecha
      total_amount,
      sale_fee  // Incluye sale_fee en los datos del gráfico
    }));
  }
  

  

  // Actualizar el gráfico con los datos filtrados
// Modificamos updateChart para aceptar las órdenes filtradas como un parámetro
updateChart(filteredOrders: Order[] = this.ordersWithShippingCost) {
  this.totalSum = filteredOrders.reduce((acc, curr) => acc + curr.total_amount, 0);
  this.fees = filteredOrders.reduce((acc, curr) => acc + curr.order_items.reduce((sum, item) => sum + item.sale_fee, 0), 0);
  this.envios = filteredOrders.reduce((acc, curr) => acc + curr.listCost, 0);

    // Calcula satSum como el 9% del totalSum
    this.satSum = this.totalSum * 0.08;

    // Calcula realSum como totalSum menos satSum
    this.realSum = this.totalSum - (this.satSum + this.envios + this.fees);

  this.totalSumIsLoading = false;
  this.feesIsLoading = false;
  this.enviosIsLoading = false;
  this.satSumIsLoading = false;
  this.realSumIsLoading = false;
  // Actualizar los datos del gráfico para reflejar cualquier filtrado
  this.filteredChartData = this.chartData.filter(data => filteredOrders.some(order => new Date(order.date_created).getTime() === data.date.getTime()));

  // Configuración del gráfico
  this.options = {
    data: this.filteredChartData.map(data => ({
      date: this.datePipe.transform(data.date, 'shortDate'),
      total_amount: data.total_amount,
      sale_fee: data.sale_fee
    })),
    series: [
      {
        type: 'bar',
        xKey: 'date',
        yKey: 'total_amount',
        yName: 'Total Amount'
      },
      // {
      //   type: 'bar',
      //   xKey: 'date',
      //   yKey: 'sale_fee',
      //   yName: 'Sale Fee'
      // }
    ],
    // Añade aquí más configuraciones si necesitas
  };
}




fetchSimpleResponse() {
  this.http.get('http://localhost:3000/api/test',{ responseType: 'text' }).subscribe({
    next: (response) => {
      console.log('Respuesta recibida del backend:', response);
      alert('Respuesta del backend: ' + response);
    },
    error: (error) => {
      console.error('Error al realizar la solicitud al backend:', error);
    }
  });
}

handleAuthRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code'); // Este es el código TG que MercadoLibre envía como parámetro de URL

  if (code) {
    // Enviar este código al backend para que pueda intercambiarlo por un token de acceso
    this.authService.exchangeCodeForToken(code).subscribe({
      next: (response) => {
        // Maneja la respuesta, que incluirá el token de acceso
      },
      error: (error) => {
        // Maneja el error
      }
    });
  }
}



obtainTGCode() {
  this.authService.getTGCode().subscribe({
    next: (url) => {
      console.log('URL obtenida:', url);
      // Manejar el URL como sea necesario, por ejemplo, abrirlo en una nueva pestaña del navegador
      window.open(url, '_blank');
    },
    error: (err) => {
      console.error('Error al obtener el URL:', err);
    }
  });
}




}




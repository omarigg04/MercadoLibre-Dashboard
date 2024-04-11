import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Order } from '../interfaces/Order.interface';
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap, tap, } from 'rxjs/operators';

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

  public totalSum: number = 0;
  public envios: number = 0;
  public fees: number = 0;
  public options: any = {};
  public chartData: any[] = [];
  public filteredChartData: any[] = [];
  public ordersWithShippingCost: Order[] = []; // Asegúrate de que se actualice correctamente
  dateRangeForm: FormGroup;

  constructor(private http: HttpClient, private datePipe: DatePipe) {
    this.dateRangeForm = new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.http.get<Order[]>('http://localhost:3000/api/orders').subscribe(
      (response: Order[]) => {
        console.log('Órdenes recibidas:', response);
        const fulfilledOrders = response.filter((order) => order.fulfilled);

        fulfilledOrders.forEach((order) => {
          const date = new Date(order.date_created);
          let orderSaleFee = 0;  // Inicializa la suma de sale_fee para la orden
  
          // Sumar todos los sale_fee de los ítems de cada orden
          order.order_items.forEach(item => {
            orderSaleFee += item.sale_fee;
          });
  
          // Agrega los datos necesarios para el gráfico
          this.chartData.push({ 
            date, 
            total_amount: order.total_amount,
            sale_fee: orderSaleFee  // Guarda la suma de sale_fee para la orden
          });
        });

        this.http
          .get<Order[]>('http://localhost:3000/api/orders')
          .pipe(
            mergeMap((orders) => {
              const fulfilledOrders = orders.filter((order) => order.fulfilled);
              const shipmentCostRequests = fulfilledOrders.map((order) =>
                this.http
                  .get<{ listCost: number }>(
                    `http://localhost:3000/api/shipments/${order.shipping.id}`
                  )
                  .pipe(
                    tap((response) =>
                      console.log(
                        `Costo de envío para order ${order.id}:`,
                        response.listCost
                      )
                    ),
                    catchError((error) => {
                      console.error('Failed to fetch shipping info', error);
                      return of({ listCost: 0 });
                    })
                  )
              );
              return forkJoin(shipmentCostRequests).pipe(
                map((listCosts: { listCost: any }[]) =>
                  fulfilledOrders.map((order, index) => ({
                    ...order,
                    listCost: listCosts[index].listCost,
                  }))
                )
              );
            })
          )
          .subscribe((ordersWithShippingCost) => {
            this.ordersWithShippingCost = ordersWithShippingCost; // Actualizar la propiedad aquí
            this.envios = ordersWithShippingCost.reduce(
              (acc, curr) => acc + curr.listCost,
              0
            );
            this.enviosIsLoading = false;

            this.updateChart(); // Asegúrate de actualizar el gráfico inicialmente aquí
          });

        this.filteredChartData = [...this.chartData];
        this.updateChart();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener pedidos:', error);
      }
    );
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
  this.totalSum = this.filteredChartData.reduce(
    (acc, curr) => acc + curr.total_amount,
    0
  );

  this.fees = filteredOrders.reduce(
    (acc, curr) => acc + curr.order_items.reduce((sum, item) => sum + item.sale_fee, 0),
    0
  );

  this.envios = filteredOrders.reduce(
    (acc, curr) => acc + (curr.listCost ?? 0),
    0
  );

  // Verificar si todos los datos han sido procesados antes de ocultar los spinners
  if (filteredOrders.length > 0) {
    this.feesIsLoading = false;
    this.enviosIsLoading = false;
  }

  this.totalSumIsLoading = false;

  // Configuración del gráfico
  this.options = {
    ...this.options, // Mantenemos las opciones existentes
    data: this.filteredChartData,
    series: [
      {
        type: 'bar',
        xKey: 'date',
        yKey: 'total_amount',
        yName: 'Paid Amount',
      },
    ],
  };
}


}




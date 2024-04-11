import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Order } from '../interfaces/Order.interface';
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
  public totalSum: number = 0;
  public envios: number = 0; // Ejemplo para otra sumatoria
  public fees: number = 0; // Ejemplo para otra sumatoria
  public options: any = {};
  public chartData: any[] = [];
  public filteredChartData: any[] = [];
  public ordersWithShippingCost: Order[] = [];
  dateRangeForm: FormGroup;

  constructor(private http: HttpClient, private datePipe: DatePipe) {
    // Inicializar el FormGroup para el rango de fechas
    this.dateRangeForm = new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.http.get<Order[]>('http://localhost:3000/api/orders').subscribe(
      (response: Order[]) => {
        // Filtro para excluir las órdenes no cumplidas
        // solo las orders con fulfulled : true se agregan.

        console.log('Órdenes recibidas:', response);
        const fulfilledOrders = response.filter((order) => order.fulfilled);

        // console.log(fulfilledOrders);

        fulfilledOrders.forEach((order) => {
          const date = new Date(order.date_created);
          this.chartData.push({ date, total_amount: order.total_amount });
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
                      return of({ listCost: 0 }); // Proporciona un valor por defecto en caso de error
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
            this.envios = ordersWithShippingCost.reduce(
              (acc, curr) => acc + curr.listCost,
              0
            );
          });

        this.filteredChartData = [...this.chartData];
        this.updateChart();
      },
      (error) => {
        console.error('Error al obtener pedidos:', error);
      }
    );
  }

  private aggregateDataByDate(data: any[]): any[] {
    const aggregatedData = new Map<string, number>();
    // console.log('sumatoria function:', data);

    data.forEach(({ date, total_amount }) => {
      //   console.log('element:', data);

      // Convertir la fecha a una cadena de texto que represente solo el día, mes y año
      const dateKey = this.datePipe.transform(date, 'MM-dd-yyy');
      if (!dateKey) return;

      // Si la fecha ya existe en el mapa, sumar el monto, si no, agregarla
      if (aggregatedData.has(dateKey)) {
        aggregatedData.set(
          dateKey,
          aggregatedData.get(dateKey)! + total_amount
        );
      } else {
        aggregatedData.set(dateKey, total_amount);
      }
    });

    // Convertir el mapa de vuelta a un arreglo de objetos para el gráfico
    return Array.from(aggregatedData, ([date, total_amount]) => ({
      date: new Date(date), // Convertir la cadena de vuelta a una fecha
      total_amount,
    }));
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
      // Solo necesitamos una llamada a this.updateChart con las órdenes filtradas.
      this.updateChart(dateFilteredOrders);
    }
  }
  

  // Actualizar el gráfico con los datos filtrados
// Modificamos updateChart para aceptar las órdenes filtradas como un parámetro
updateChart(filteredOrders: Order[] = this.ordersWithShippingCost) {
    this.totalSum = this.filteredChartData.reduce(
      (acc, curr) => acc + curr.total_amount,
      0
    );
  
    // Calculamos envios basado en las órdenes filtradas
    this.envios = filteredOrders.reduce((acc, curr) => acc + (curr.listCost ?? 0), 0);
  
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




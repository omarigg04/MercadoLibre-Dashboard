


import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Order } from '../interfaces/Order.interface';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
  public options: any = {};
  public chartData: any[] = [];
  public filteredChartData: any[] = [];
  dateRangeForm: FormGroup;

  constructor(private http: HttpClient) {
    // Inicializar el FormGroup para el rango de fechas
    this.dateRangeForm = new FormGroup({
      start: new FormControl(),
      end: new FormControl()
    });
  }

  ngOnInit(): void {
    this.http.get<Order[]>('http://localhost:3000/api/orders').subscribe(
      (response: Order[]) => {
        response.forEach(order => {
          const date = new Date(order.date_created);
          this.chartData.push({ date, paid_amount: order.paid_amount });
        });
        this.filteredChartData = [...this.chartData];
        this.updateChart();
      },
      (error) => {
        console.error('Error al obtener pedidos:', error);
      }
    );
  }

  // La función applyFilter ahora usa el formulario para obtener las fechas
  applyFilter() {
    const { start, end } = this.dateRangeForm.value;
    if (start && end) {
      this.filteredChartData = this.chartData.filter(data => data.date >= start && data.date <= end);
      this.updateChart();
    }
  }
  // Actualizar el gráfico con los datos filtrados
  updateChart() {
    console.log(this.chartData);
    console.log('filtered',this.filteredChartData);
    
    
    this.options = {
      ...this.options, // Mantenemos las opciones existentes
      data: this.filteredChartData,
      series: [
        {
          type: 'bar',
          xKey: 'date',
          yKey: 'paid_amount',
          yName: 'Paid Amount',
        },
      ],
    };
  }
}


import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BarChartComponent } from './bar-chart/bar-chart.component'; // Ajusta esta ruta también

// Define tus rutas aquí
const routes: Routes = [
  { path: 'grid', component: DashboardComponent },
  { path: 'chart', component: BarChartComponent },
  { path: '', redirectTo: '/chart', pathMatch: 'full' }, // Redirecciona a '/table' como ruta por defecto
  { path: '**', redirectTo: '/table' } // Redirecciona cualquier ruta no encontrada a '/table', opcionalmente puedes crear un componente de PageNotFound
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

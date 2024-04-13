// En el archivo auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000'; // Asegúrate de que la URL sea correcta para tu backend

  constructor(private http: HttpClient) {}

  getTGCode() {
    // Este método ahora devuelve el Observable directamente
    return this.http.get(`${this.baseUrl}/auth/mercadolibre`, { responseType: 'text' });
  }


  
  // En tu servicio de autenticación
  exchangeCodeForToken(code: string) {
    return this.http.post(`${this.baseUrl}/exchange-code`, { code });
  }


}

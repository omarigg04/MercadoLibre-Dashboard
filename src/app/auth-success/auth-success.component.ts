import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-auth-success',
  templateUrl: './auth-success.component.html',
  styleUrls: ['./auth-success.component.scss']
})
export class AuthSuccessComponent {
  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Extraer el código de la URL
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.handleAuthorizationCode(code);
      } else {
        // Manejar el caso de no recibir el código, redireccionar a una página de error o inicio
        this.router.navigate(['/']);
      }
    });
  }

  handleAuthorizationCode(code: string) {
    // Aquí podrías llamar a un servicio para intercambiar el código por un token
    this.authService.exchangeCodeForToken(code).subscribe({
      next: (response) => {
        // Procesar la respuesta, guardar el token, etc.
        console.log('Token received:', response);
        // Redireccionar al usuario a la página principal o de dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error during token exchange:', error);
        // Opcionalmente manejar errores, mostrar mensajes, etc.
        this.router.navigate(['/error']);
      }
    });
  }
}

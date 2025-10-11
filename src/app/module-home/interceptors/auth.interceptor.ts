import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/Auth.Service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Si hay token, clonar la petición con encabezado Authorization
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  // Enviar la petición y manejar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Token expirado o inválido. Redirigiendo al login...');
        authService.clearToken();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

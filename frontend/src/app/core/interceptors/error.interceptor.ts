import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        notificationService.showError('Error de conexión con el servidor');
        return throwError(() => error);
      }

      const errorMessage = error.error?.message || 'Ha ocurrido un error inesperado';

      switch (error.status) {
        case 401:
          notificationService.showError('Sesión expirada. Por favor, inicia sesión nuevamente');
          authService.logout();
          router.navigate(['/login']);
          break;

        case 403:
          notificationService.showError('No tienes permisos para realizar esta acción');
          break;

        case 404:
          notificationService.showError('Recurso no encontrado');
          break;

        case 400:
          if (error.error?.errors) {
            const firstError = error.error.errors[0];
            notificationService.showError(firstError.message || errorMessage);
          } else {
            notificationService.showError(errorMessage);
          }
          break;

        case 500:
          notificationService.showError('Error interno del servidor');
          break;

        default:
          notificationService.showError(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 [Auth Interceptor] URL:', req.url);
  
  const token = authService.getToken();
  console.log('🔐 [Auth Interceptor] Token found:', !!token);
  
  let authReq = req;
  
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('🔐 [Auth Interceptor] Added Authorization header');
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('🔐 [Auth Interceptor] Error:', error.status, error.url);
      
      if (error.status === 401) {
        console.log('🔐 [Auth Interceptor] 401 Unauthorized - Logging out');
        authService.logout();
        router.navigate(['/login']);
      }
      
      // Convierte error de snake_case a camelCase si es necesario
      if (error.error && typeof error.error === 'object') {
        const camelError = Object.keys(error.error).reduce((acc, key) => {
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          acc[camelKey] = error.error[key];
          return acc;
        }, {} as any);
        
        return throwError(() => ({
          ...error,
          error: camelError
        }));
      }
      
      return throwError(() => error);
    })
  );
};
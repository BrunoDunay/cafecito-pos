import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { snakeCaseInterceptor } from './core/interceptors/snake-case.interceptor'; // Cambia a función

export const appConfig: ApplicationConfig = {
  providers: [
    // Rutas
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([
        authInterceptor,        // Maneja autenticación (JWT)
        snakeCaseInterceptor    // Transforma nombres
      ])
    ),
  ],
};
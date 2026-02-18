import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { HTTP_INTERCEPTORS, HttpHandlerFn, HttpRequest } from '@angular/common/http';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockNext: HttpHandlerFn = (req) => {
    return new Observable(subscriber => {
      subscriber.next({} as any);
      subscriber.complete();
    });
  };

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', ['showError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Pruebas de headers', () => {
    it('debe agregar el token al header cuando el usuario tiene token', (done) => {
      authServiceMock.getToken.and.returnValue('test-token');

      const req = new HttpRequest('GET', '/api/test');
      
      const next: HttpHandlerFn = (modifiedReq) => {
        expect(modifiedReq.headers.has('Authorization')).toBeTrue();
        expect(modifiedReq.headers.get('Authorization')).toBe('Bearer test-token');
        done();
        return new Observable(subscriber => subscriber.complete());
      };

      TestBed.runInInjectionContext(() => {
        return authInterceptor(req, next).subscribe();
      });
    });

    it('NO debe agregar header cuando no hay token', (done) => {
      authServiceMock.getToken.and.returnValue(null);

      const req = new HttpRequest('GET', '/api/test');
      
      const next: HttpHandlerFn = (modifiedReq) => {
        expect(modifiedReq.headers.has('Authorization')).toBeFalse();
        done();
        return new Observable(subscriber => subscriber.complete());
      };

      TestBed.runInInjectionContext(() => {
        return authInterceptor(req, next).subscribe();
      });
    });
  });

  describe('Pruebas de errores', () => {
    it('debe manejar error 401 cerrando sesión y redirigiendo al login', (done) => {
      authServiceMock.getToken.and.returnValue('test-token');

      const req = new HttpRequest('GET', '/api/test');
      
      const next: HttpHandlerFn = () => {
        return throwError(() => new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: { message: 'No autorizado' }
        }));
      };

      TestBed.runInInjectionContext(() => {
        return authInterceptor(req, next).subscribe({
          error: () => {
            expect(notificationServiceMock.showError).toHaveBeenCalledWith(
              'Sesión expirada. Por favor, inicia sesión nuevamente'
            );
            expect(authServiceMock.logout).toHaveBeenCalled();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
            done();
          }
        });
      });
    });

    it('NO debe manejar errores que no son 401', (done) => {
      authServiceMock.getToken.and.returnValue('test-token');

      const req = new HttpRequest('GET', '/api/test');
      
      const next: HttpHandlerFn = () => {
        return throwError(() => new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          error: { message: 'Not found' }
        }));
      };

      TestBed.runInInjectionContext(() => {
        return authInterceptor(req, next).subscribe({
          error: (error) => {
            expect(notificationServiceMock.showError).not.toHaveBeenCalled();
            expect(authServiceMock.logout).not.toHaveBeenCalled();
            expect(routerMock.navigate).not.toHaveBeenCalled();
            expect(error.status).toBe(404);
            done();
          }
        });
      });
    });
  });
});
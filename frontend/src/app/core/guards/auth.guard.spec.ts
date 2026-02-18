import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('debe permitir el acceso cuando el usuario está logueado', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);

    const resultado = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(resultado).toBeTrue();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('debe redirigir al login cuando el usuario NO está logueado', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);

    const resultado = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(resultado).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
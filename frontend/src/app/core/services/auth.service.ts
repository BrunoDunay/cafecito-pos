import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { tap, map } from 'rxjs/operators';
import { loginResponseSchema, AuthUser } from '../types/auth';
import { UserCredentials } from '../types/user';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // Iniciar sesión
  login(credentials: UserCredentials) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => loginResponseSchema.parse(response)),
      tap(({ token, refreshToken, user }) => {
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));
      }),
    );
  }

  // Refrescar token
  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
    );
  }

  // Obtener usuario autenticado
  getCurrentUser() {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      map((response: any) => ({
        userId: response.user_id,
        email: response.email,
        role: response.role,
      })),
    );
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Verificar si hay sesión activa
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener usuario desde localStorage
  getUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Obtener rol del usuario
  getRole(): 'admin' | 'seller' | null {
    const user = this.getUser();
    return user ? user.role : null;
  }
}
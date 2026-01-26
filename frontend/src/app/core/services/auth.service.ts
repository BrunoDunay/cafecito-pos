import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { tap, map } from 'rxjs/operators';

import { loginResponseSchema, AuthUser } from '../types/auth';
import { UserCredentials } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: UserCredentials) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map(response => loginResponseSchema.parse(response)),
      tap(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getRole(): 'admin' | 'seller' | null {
    const user = this.getUser();
    return user ? user.role : null;
  }
}

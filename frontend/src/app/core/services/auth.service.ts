import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { map, tap } from 'rxjs/operators';

import { loginResponseSchema } from '../types/auth';
import { UserCredentials } from '../types/user';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller';
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: UserCredentials) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map(response => loginResponseSchema.parse(response)),
      tap(({ token, user }) => {
        const mappedUser: AuthUser = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(mappedUser));
      })
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

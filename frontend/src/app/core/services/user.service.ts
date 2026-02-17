import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import z from 'zod';
import { userSchema } from '../types/user';

export const userArraySchema = z.array(userSchema);

export const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['admin', 'seller']).default('seller')
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Correo electrónico inválido').optional(),
  role: z.enum(['admin', 'seller']).optional(),
  isActive: z.boolean().optional()
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type User = z.infer<typeof userSchema>;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getAll(): Observable<User[]> {
    return this.http
      .get(this.apiUrl)
      .pipe(map((res) => userArraySchema.parse(res)));
  }

  // Obtener usuario por ID
  getById(id: string): Observable<User> {
    return this.http
      .get(`${this.apiUrl}/${id}`)
      .pipe(map((res) => userSchema.parse(res)));
  }

  // Crear usuario
  create(userData: CreateUserDto): Observable<User> {
    return this.http
      .post(this.apiUrl, userData)
      .pipe(map((res) => userSchema.parse(res)));
  }

  // Actualizar usuario
  update(id: string, userData: UpdateUserDto): Observable<User> {
    return this.http
      .put(`${this.apiUrl}/${id}`, userData)
      .pipe(map((res) => userSchema.parse(res)));
  }

  // Eliminar usuario
  delete(id: string): Observable<{ message: string; userId: string }> {
    return this.http.delete<{ message: string; userId: string }>(
      `${this.apiUrl}/${id}`
    );
  }

  // Activar/desactivar usuario
  toggleActive(id: string, isActive: boolean): Observable<User> {
    return this.update(id, { isActive });
  }
}
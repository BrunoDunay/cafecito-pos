import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { categoryArraySchema, categorySchema } from '../types/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  // Obtener todas las categorías
  getAll() {
    return this.http.get(this.apiUrl).pipe(
      map(response => categoryArraySchema.parse(response))
    );
  }

  // Crear categoría
  create(name: string) {
    return this.http.post(this.apiUrl, { name }).pipe(
      map(response => categorySchema.parse(response))
    );
  }

  // Eliminar categoría
  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
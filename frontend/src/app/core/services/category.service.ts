import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import z from 'zod';

import { environment } from '../../../enviroments/enviroment';
import {
  categoryArraySchema,
  categorySchema,
  Category
} from '../types/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(this.apiUrl).pipe(
      map(response => categoryArraySchema.parse(response))
    );
  }

  create(name: string) {
    return this.http.post(this.apiUrl, { name }).pipe(
      map(response => categorySchema.parse(response))
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

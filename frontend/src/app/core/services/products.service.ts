import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import z from 'zod';
import { productArraySchema } from '../types/product';

const responseSchema = z.object({
  data: productArraySchema,
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type ProductsResponse = z.infer<typeof responseSchema>;

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(
    page: number = 1,
    limit: number = 10,
    category?: string,
    q?: string
  ) {
    const params: any = { page, limit };
    if (q) params.q = q;
    if (category) params.category = category;

    return this.http
      .get(this.apiUrl, { params })
      .pipe(map((res) => responseSchema.parse(res)));
  }
}
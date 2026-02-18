import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';
import z from 'zod';
import { productArraySchema, productSchema } from '../types/product';
import { Product } from '../types/product';

const responseSchema = z.object({
  data: productArraySchema,
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

const singleProductResponseSchema = z.union([
  z.object({ data: productSchema }),
  productSchema
]);

export type ProductsResponse = z.infer<typeof responseSchema>;

export const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  stock: z.number().min(0, 'El stock no puede ser negativo'),
  image: z.string().optional(),
  category: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getAll(
    page: number = 1,
    limit: number = 10,
    category?: string,
    q?: string
  ): Observable<ProductsResponse> {
    const params: any = { page, limit };
    if (q) params.q = q;
    if (category) params.category = category;

    return this.http
      .get(this.apiUrl, { params })
      .pipe(map((res) => responseSchema.parse(res)));
  }

  // Obtener producto por ID
  getById(id: string): Observable<Product> {
    return this.http
      .get(`${this.apiUrl}/${id}`)
      .pipe(
        map((res) => {
          const parsed = singleProductResponseSchema.parse(res);
          return 'data' in parsed ? parsed.data : parsed;
        })
      );
  }

  // Crear producto
  create(productData: CreateProductDto): Observable<Product> {
    return this.http
      .post(this.apiUrl, productData)
      .pipe(
        map((res) => {
          const parsed = singleProductResponseSchema.parse(res);
          return 'data' in parsed ? parsed.data : parsed;
        })
      );
  }

  // Actualizar producto
  update(id: string, productData: Partial<CreateProductDto>): Observable<Product> {
    return this.http
      .put(`${this.apiUrl}/${id}`, productData)
      .pipe(
        map((res) => {
          const parsed = singleProductResponseSchema.parse(res);
          return 'data' in parsed ? parsed.data : parsed;
        })
      );
  }

  // Eliminar producto
  delete(id: string): Observable<{ message: string; productId: string }> {
    return this.http.delete<{ message: string; productId: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}
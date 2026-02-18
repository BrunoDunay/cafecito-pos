import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../enviroments/environment';
import { saleSchema, Sale } from '../types/sale';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  // Crear nueva venta
  createSale(payload: {
    customerId?: string;
    paymentMethod: string;
    items: { productId: string; quantity: number }[];
    discountPercent?: number;
    discountAmount?: number;
  }) {
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map((response) => {
        const saleData = response.data || response;
        return saleSchema.parse(saleData);
      })
    );
  }

  // Obtener ventas paginadas
  getSales(page: number = 1, limit: number = 20) {
    const params = { page, limit };
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return {
            sales: response,
            pagination: {
              page,
              limit,
              total: response.length,
              pages: Math.ceil(response.length / limit)
            }
          };
        } else if (response.sales && Array.isArray(response.sales)) {
          return {
            sales: response.sales,
            pagination: response.pagination || {
              page,
              limit,
              total: response.sales.length,
              pages: Math.ceil(response.sales.length / limit)
            }
          };
        } else if (response.data && Array.isArray(response.data)) {
          return {
            sales: response.data,
            pagination: response.pagination || {
              page,
              limit,
              total: response.data.length,
              pages: Math.ceil(response.data.length / limit)
            }
          };
        }
        
        return {
          sales: Array.isArray(response) ? response : [],
          pagination: {
            page,
            limit,
            total: Array.isArray(response) ? response.length : 0,
            pages: 1
          }
        };
      })
    );
  }

  // Obtener venta por ID
  getSaleById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        const saleData = response.data || response;
        return saleSchema.parse(saleData);
      })
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import { saleSchema, Sale } from '../types/sale'; 

@Injectable({ providedIn: 'root' })
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  createSale(payload: {
    customerId?: string;
    paymentMethod: string;
    items: { productId: string; quantity: number }[];
  }) {
    
    return this.http.post(this.apiUrl, payload).pipe(
      map((response) => saleSchema.parse(response))
    );
  }

  getSales(page: number = 1, limit: number = 20) {
    const params = { page, limit };
    return this.http.get(this.apiUrl, { params });
  }

  getSaleById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      map((response) => saleSchema.parse(response))
    );
  }
}
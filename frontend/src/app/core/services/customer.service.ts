import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Customer } from '../types/customer';

export interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

export interface ToggleStatusResponse {
  success: boolean;
  message: string;
  customer: Customer;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customers`;
  private customersChanged = new Subject<void>();
  customersChanged$ = this.customersChanged.asObservable();

  constructor(private http: HttpClient) {}

  private notifyCustomersChanged(): void {
    this.customersChanged.next();
  }

  // Obtener todos los clientes
  getAll(page: number = 1, limit: number = 20, q?: string): Observable<CustomersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (q) {
      params = params.set('q', q);
    }

    return this.http.get<CustomersResponse>(this.apiUrl, { params });
  }

  // Crear nuevo cliente
  create(customerData: { name: string; email: string; phone?: string }): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customerData).pipe(
      tap(() => this.notifyCustomersChanged())
    );
  }

  // Eliminar cliente
  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.notifyCustomersChanged())
    );
  }

  // Alternar estado activo/inactivo
  toggleStatus(id: string, isActive: boolean): Observable<ToggleStatusResponse> {
    return this.http.patch<ToggleStatusResponse>(
      `${this.apiUrl}/${id}/status`, 
      { is_active: isActive }
    ).pipe(
      tap(() => this.notifyCustomersChanged())
    );
  }
}
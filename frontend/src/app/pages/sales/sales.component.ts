// components/sales/sales.component.ts - ACTUALIZAR FORMATO DE MONEDA
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SaleService } from '../../core/services/sale.service';
import { Sale } from '../../core/types/sale';
import { TicketModalComponent } from './ticket-modal/ticket-modal.component';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, TicketModalComponent],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
  private saleService = inject(SaleService);
  
  // Signals
  sales = signal<Sale[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  
  // Modal
  selectedSale = signal<Sale | null>(null);
  showTicketModal = signal(false);
  
  ngOnInit(): void {
    this.loadSales();
  }
  
  loadSales(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.saleService.getSales(this.currentPage(), this.itemsPerPage()).subscribe({
      next: (response) => {
        const salesArray = response.sales;
        
        if (salesArray && salesArray.length > 0) {
          this.sales.set(salesArray);
          this.totalItems.set(response.pagination?.total || salesArray.length);
        } else {
          this.sales.set([]);
          this.totalItems.set(0);
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading sales:', err);
        this.error.set('Error al cargar el historial de ventas');
        this.loading.set(false);
      }
    });
  }
  
  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadSales();
  }
  
  getPaymentMethodLabel(method: string): string {
    const labels: {[key: string]: string} = {
      'cash': '💵 Efectivo',
      'card': '💳 Tarjeta',
      'transfer': '🏦 Transferencia'
    };
    return labels[method] || method;
  }
  
  getTotalPages(): number {
    return Math.ceil(this.totalItems() / this.itemsPerPage());
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      const datePart = new Intl.DateTimeFormat('es-MX', {  // <-- Cambiado a es-MX
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
      
      const timePart = new Intl.DateTimeFormat('es-MX', {  // <-- Cambiado a es-MX
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
      return `${datePart} - ${timePart}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateString;
    }
  }
  
  formatCurrency(amount: number): string {  
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
  
  showTicket(sale: Sale): void {
    this.selectedSale.set(sale);
    this.showTicketModal.set(true);
  }
  
  closeTicketModal(): void {
    this.showTicketModal.set(false);
    this.selectedSale.set(null);
  }
  
  getCustomerName(sale: Sale): string {
    if (sale.customerName) {
      return sale.customerName;
    } else if (sale.customerId) {
      return 'Cliente registrado';
    } else {
      return 'Venta general';
    }
  }
}
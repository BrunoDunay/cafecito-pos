// components/sales/ticket-modal/ticket-modal.component.ts - CON MXN
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sale } from '../../../core/types/sale';

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-modal.component.html',
  styleUrls: ['./ticket-modal.component.css']
})
export class TicketModalComponent implements OnChanges {
  @Input() sale: Sale | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isVisible) {
      document.body.style.overflow = 'hidden';
    } else if (changes['isVisible'] && !this.isVisible) {
      document.body.style.overflow = '';
    }
  }

  hide(): void {
    this.close.emit();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {  // <-- Cambiado a es-MX
      style: 'currency',
      currency: 'MXN',  // <-- Cambiado a MXN
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {  // <-- Cambiado a es-MX
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {  // <-- Cambiado a es-MX
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }

  getPaymentMethodLabel(method: string): string {
    const labels: {[key: string]: string} = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia'
    };
    return labels[method] || method;
  }

  printTicket(): void {
    if (!this.sale) return;
    
    const printContent = document.querySelector('.ticket-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket de Venta</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 20px;
              max-width: 400px;
            }
            .ticket-title {
              text-align: center;
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 5px;
            }
            .ticket-subtitle {
              text-align: center;
              font-size: 14px;
              margin-bottom: 15px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 12px;
            }
            .separator {
              border-bottom: 1px dashed #000;
              margin: 10px 0;
            }
            .products-header {
              display: flex;
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 5px;
            }
            .product-name { flex: 3; }
            .product-qty, .product-price, .product-total { 
              flex: 1; 
              text-align: center; 
            }
            .product-row {
              display: flex;
              font-size: 12px;
              margin: 3px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 12px;
            }
            .grand-total {
              font-weight: bold;
              font-size: 14px;
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer-text {
              text-align: center;
              font-style: italic;
              font-size: 11px;
              margin: 5px 0;
            }
            .discount-value {
              color: #28a745;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}
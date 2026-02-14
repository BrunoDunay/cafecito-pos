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
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
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
    
    const ticketContent = document.querySelector('.ticket-content');
    if (!ticketContent) return;

    const contentClone = ticketContent.cloneNode(true) as HTMLElement;
    
    const buttonsToRemove = contentClone.querySelectorAll('button');
    buttonsToRemove.forEach(btn => btn.remove());

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Venta</title>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { 
                padding: 20px; 
                font-family: 'Courier New', monospace;
              }
              .no-print { display: none; }
            }
            body {
              max-width: 400px;
              margin: 0 auto;
              background: white;
            }
          </style>
        </head>
        <body>
          ${contentClone.outerHTML}
          <div class="text-center mt-4 text-xs text-gray-400 no-print">
            <p>Usa Ctrl+P para imprimir</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}
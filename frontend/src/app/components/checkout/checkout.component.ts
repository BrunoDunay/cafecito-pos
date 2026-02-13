// checkout.component.ts - CON NOMBRE CORRECTO
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { CartService } from '../../core/services/cart.services';
import { SaleService } from '../../core/services/sale.service';
import { SuccessModalComponent } from '../success/success.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, SuccessModalComponent], // <-- Usar SuccessModalComponent
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private saleService = inject(SaleService);
  private router = inject(Router);
  
  // Signals
  cart = this.cartService.cart;
  paymentMethod = signal<string>('cash');
  cashAmount = signal<number>(0);
  isProcessing = signal(false);
  
  // Modal de éxito
  showSuccessModal = signal(false);
  successTitle = signal('¡Venta Exitosa!');
  successMessage = signal('La venta se ha procesado correctamente');
  saleDetails = signal('');
  
  // Computed
  changeAmount = computed(() => {
    if (this.paymentMethod() === 'cash') {
      const cash = this.cashAmount();
      const total = this.cart().total;
      return cash >= total ? cash - total : 0;
    }
    return 0;
  });
  
  showCashInput = computed(() => this.paymentMethod() === 'cash');
  
  // Métodos de pago
  paymentMethods = [
    { id: 'cash', name: '💵 Efectivo', icon: '💰' },
    { id: 'card', name: '💳 Tarjeta', icon: '💳' },
    { id: 'transfer', name: '🏦 Transferencia', icon: '🏦' }
  ];
  
  ngOnInit(): void {
    // Validar que haya productos en el carrito
    if (this.cart().isEmpty) {
      this.router.navigate(['/products']);
      return;
    }
    
    // Inicializar cashAmount con el total
    this.cashAmount.set(this.cart().total);
  }
  
  updatePaymentMethod(method: string): void {
    this.paymentMethod.set(method);
  }
  
  updateCashAmount(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const amount = parseFloat(value) || 0;
    this.cashAmount.set(amount);
  }
  
  async processSale(): Promise<void> {
    if (this.isProcessing()) return;
    
    // Validaciones
    if (this.cart().isEmpty) {
      this.showErrorAlert('El carrito está vacío');
      return;
    }
    
    if (!this.paymentMethod()) {
      this.showErrorAlert('Selecciona un método de pago');
      return;
    }
    
    // Validar efectivo si es el método seleccionado
    if (this.paymentMethod() === 'cash') {
      if (this.cashAmount() < this.cart().total) {
        this.showErrorAlert(`El efectivo debe ser al menos ${this.formatCurrency(this.cart().total)}`);
        return;
      }
    }
    
    const payload = {
      customerId: this.cart().customer?.customerId || undefined,
      paymentMethod: this.paymentMethod(),
      items: this.cart().items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      discountPercent: this.cart().discountPercent,
      discountAmount: this.cart().discountAmount
    };
    
    console.log('Payload para crear venta:', payload);
    
    this.isProcessing.set(true);
    
    try {
      const sale = await lastValueFrom(this.saleService.createSale(payload));
      
      // Mostrar modal de éxito
      this.saleDetails.set(`ID: ${sale.saleId.substring(0, 8)}...\nTotal: ${this.formatCurrency(sale.total)}`);
      this.showSuccessModal.set(true);
      
      // Limpiar carrito
      this.cartService.clearCart();
      
      // Cierre automático y redirección
      setTimeout(() => {
        this.showSuccessModal.set(false);
        this.router.navigate(['/products']);
      }, 1500); 
      
    } catch (error: any) {
      console.error('Error procesando venta:', error);
      
      let errorMessage = 'Error al procesar la venta';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.showErrorAlert(errorMessage);
    } finally {
      this.isProcessing.set(false);
    }
  }
  
  private showErrorAlert(message: string): void {
    alert(`❌ ${message}`);
  }
  
  cancelCheckout(): void {
    if (confirm('¿Cancelar la venta? Los productos permanecerán en el carrito.')) {
      this.router.navigate(['/products']);
    }
  }
  
  // Moneda en MXN
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
}
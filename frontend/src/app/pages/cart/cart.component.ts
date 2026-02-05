// cart.component.ts - Versión que escucha cambios en clientes
import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../core/services/cart.services';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/types/customer';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  
  // Signals
  cart = this.cartService.cart;
  showCustomerSelector = signal(false);
  allCustomers = signal<Customer[]>([]);
  filteredCustomers = signal<Customer[]>([]);
  loadingCustomers = signal(false);
  searchTerm = signal('');
  
  // Subscription para cambios en clientes
  private customersChangedSubscription!: Subscription;
  
  // Computed para el mensaje de descuento
  discountMessage = computed(() => {
    const customer = this.cart().customer;
    if (!customer) return '';
    
    const purchasesCount = customer.purchasesCount;
    
    if (purchasesCount === 0) {
      return 'Bienvenido a Cafecito Feliz';
    } else if (purchasesCount >= 1 && purchasesCount <= 3) {
      return 'Tienes 5% en tu próxima compra';
    } else if (purchasesCount >= 4 && purchasesCount <= 7) {
      return '¡Estás en el club! 10% de descuento';
    } else if (purchasesCount >= 8) {
      return 'Eres VIP. 15% en cada compra';
    }
    
    return '';
  });
  
  ngOnInit(): void {
    // Cargar clientes al inicializar
    this.loadCustomers();
    
    // Suscribirse a cambios en clientes
    this.customersChangedSubscription = this.customerService.customersChanged$
      .subscribe(() => {
        this.handleCustomersChanged();
      });
  }
  
  ngOnDestroy(): void {
    // Limpiar subscription
    if (this.customersChangedSubscription) {
      this.customersChangedSubscription.unsubscribe();
    }
  }
  
  // Manejar cambios en clientes
  private handleCustomersChanged(): void {
    console.log('Clientes cambiaron - actualizando lista en carrito');
    
    // Si el selector está abierto, recargar clientes
    if (this.showCustomerSelector()) {
      this.loadCustomers();
    } else {
      // Si no está abierto, solo actualizar la lista en memoria
      // para cuando se abra después
      this.refreshCustomersInBackground();
    }
    
    // Verificar si el cliente actual sigue activo
    this.validateCurrentCustomer();
  }
  
  // Recargar lista de clientes
  loadCustomers(): void {
    this.loadingCustomers.set(true);
    this.customerService.getAll(1, 100, '').subscribe({
      next: (response) => {
        // Filtrar solo clientes activos y ordenar por nombre
        const activeCustomers = response.data
          .filter(c => c.isActive)
          .sort((a, b) => a.name.localeCompare(b.name));
        
        this.allCustomers.set(activeCustomers);
        this.filteredCustomers.set(activeCustomers);
        this.loadingCustomers.set(false);
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.loadingCustomers.set(false);
      }
    });
  }
  
  // Refrescar clientes en segundo plano (sin mostrar loading)
  private refreshCustomersInBackground(): void {
    this.customerService.getAll(1, 100, '').subscribe({
      next: (response) => {
        const activeCustomers = response.data
          .filter(c => c.isActive)
          .sort((a, b) => a.name.localeCompare(b.name));
        
        this.allCustomers.set(activeCustomers);
        
        // Si el selector está cerrado pero tenemos datos filtrados,
        // actualizarlos también
        if (!this.showCustomerSelector()) {
          this.filteredCustomers.set(activeCustomers);
        }
      },
      error: (err) => {
        console.error('Error refreshing customers in background:', err);
      }
    });
  }
  
  // Validar si el cliente actual sigue siendo válido
  private validateCurrentCustomer(): void {
    const currentCustomer = this.cart().customer;
    if (!currentCustomer) return;
    
    // Recargar información del cliente actual
    this.customerService.getAll(1, 100, '').subscribe({
      next: (response) => {
        const updatedCustomer = response.data.find(c => 
          c.customerId === currentCustomer.customerId
        );
        
        if (!updatedCustomer) {
          // Cliente fue eliminado
          console.log('Cliente actual fue eliminado - removiendo del carrito');
          this.cartService.setCustomer(null);
        } else if (!updatedCustomer.isActive) {
          // Cliente fue desactivado
          console.log('Cliente actual fue desactivado - removiendo del carrito');
          this.cartService.setCustomer(null);
        } else {
          // Cliente sigue activo, actualizar información si es necesario
          if (updatedCustomer.purchasesCount !== currentCustomer.purchasesCount) {
            console.log('Actualizando información del cliente (compras cambiaron)');
            // El descuento se recalculará automáticamente por el effect en CartService
          }
        }
      },
      error: (err) => {
        console.error('Error validating current customer:', err);
      }
    });
  }
  
  // Filtrar clientes en tiempo real
  filterCustomers(search: string): void {
    this.searchTerm.set(search);
    const term = search.toLowerCase().trim();
    
    if (!term) {
      this.filteredCustomers.set(this.allCustomers());
      return;
    }
    
    const filtered = this.allCustomers().filter(customer =>
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      (customer.phone && customer.phone.includes(term))
    );
    
    this.filteredCustomers.set(filtered);
  }
  
  // Métodos para manejar cantidad
  increaseQuantity(item: CartItem): void {
    try {
      this.cartService.updateQuantity(item.productId, item.quantity + 1);
    } catch (error: any) {
      alert(error.message);
    }
  }
  
  decreaseQuantity(item: CartItem): void {
    try {
      this.cartService.updateQuantity(item.productId, item.quantity - 1);
    } catch (error: any) {
      alert(error.message);
    }
  }
  
  removeItem(productId: string): void {
    this.cartService.removeProduct(productId);
  }
  
  clearCart(): void {
    if (confirm('¿Vaciar carrito?')) {
      this.cartService.clearCart();
    }
  }
  
  toggleCustomerSelector(): void {
    const currentState = this.showCustomerSelector();
    this.showCustomerSelector.set(!currentState);
    
    if (!currentState && this.allCustomers().length === 0) {
      this.loadCustomers();
    } else if (!currentState) {
      // Al abrir el selector, resetear la búsqueda
      this.searchTerm.set('');
      this.filteredCustomers.set(this.allCustomers());
    }
  }
  
  selectCustomer(customer: Customer): void {
    this.cartService.setCustomer(customer);
    this.showCustomerSelector.set(false);
    this.searchTerm.set(''); // Limpiar búsqueda al seleccionar
  }
  
  removeCustomer(): void {
    this.cartService.setCustomer(null);
  }
  
  // Calcular descuento para un cliente específico
  getCustomerDiscount(customer: Customer): number {
    const purchasesCount = customer.purchasesCount;
    
    if (purchasesCount === 0) return 0;
    if (purchasesCount >= 1 && purchasesCount <= 3) return 5;
    if (purchasesCount >= 4 && purchasesCount <= 7) return 10;
    if (purchasesCount >= 8) return 15;
    
    return 0;
  }
  
  // Ir al checkout con validación
  proceedToCheckout(): void {
    if (this.cart().isEmpty) {
      alert('El carrito está vacío');
      return;
    }
    
    // Validar stock antes de proceder
    const stockValidation = this.cartService.validateStock();
    if (!stockValidation.valid) {
      alert('Error de stock:\n' + stockValidation.errors.join('\n'));
      return;
    }
    
    // Navegar a la página de checkout
    this.router.navigate(['/checkout']);
  }
}
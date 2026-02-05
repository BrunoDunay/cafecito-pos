import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomerService, ToggleStatusResponse } from '../../core/services/customer.service';
import { SearchService } from '../../core/services/search.service';
import { Customer } from '../../core/types/customer';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class CustomersComponent implements OnInit, OnDestroy {
  customers = signal<Customer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  currentPage = signal(1);
  itemsPerPage = signal(20);
  totalItems = signal(0);
  
  showModal = signal(false);
  customerForm: FormGroup;
  
  private searchSubscription!: Subscription;
  private searchTerm = '';

  constructor(
    private customerService: CustomerService,
    private searchService: SearchService,
    private fb: FormBuilder
  ) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    
    this.searchSubscription = this.searchService.search$.subscribe(term => {
      this.searchTerm = term;
      this.currentPage.set(1);
      this.loadCustomers();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.customerService.getAll(
      this.currentPage(), 
      this.itemsPerPage(), 
      this.searchTerm
    ).subscribe({
      next: (response) => {
        this.customers.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.error.set('Error al cargar los clientes');
        this.loading.set(false);
      }
    });
  }

  openModal(): void {
    this.showModal.set(true);
    this.customerForm.reset();
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  createCustomer(): void {
    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    const customerData = this.customerForm.value;

    this.customerService.create(customerData)
      .subscribe({
        next: (customer) => {
          if (this.searchTerm) {
            this.loadCustomers();
          } else {
            this.customers.update(customers => [customer, ...customers.slice(0, 19)]);
            this.totalItems.update(total => total + 1);
          }
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating customer:', err);
          if (err.status === 409) {
            this.customerForm.get('email')?.setErrors({ duplicate: true });
          } else {
            this.error.set('Error al crear el cliente');
          }
        }
      });
  }

  // Alternar estado activo/inactivo
  toggleCustomerStatus(customer: Customer): void {
    const newStatus = !customer.isActive;
    
    this.customers.update(customers => 
      customers.map(c => 
        c.customerId === customer.customerId 
          ? { ...c, isActive: newStatus } 
          : c
      )
    );

    this.customerService.toggleStatus(customer.customerId, newStatus)
      .subscribe({
        next: (response: ToggleStatusResponse) => {
          console.log(response.message);
        },
        error: (err) => {
          console.error('Error toggling customer status:', err);
          
          this.customers.update(customers => 
            customers.map(c => 
              c.customerId === customer.customerId 
                ? { ...c, isActive: customer.isActive } 
                : c
            )
          );
        }
      });
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`¿Eliminar al cliente ${customer.name}?`)) {
      if (customer.purchasesCount > 0) {
        alert('No se puede eliminar un cliente con compras registradas');
        return;
      }

      this.customerService.delete(customer.customerId)
        .subscribe({
          next: () => {
            if (this.searchTerm) {
              this.loadCustomers();
            } else {
              this.customers.update(customers => 
                customers.filter(c => c.customerId !== customer.customerId)
              );
              this.totalItems.update(total => total - 1);
            }
          },
        });
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCustomers();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.itemsPerPage());
  }

  get hasPreviousPage(): boolean {
    return this.currentPage() > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage() < this.totalPages;
  }

  get currentSearchTerm(): string {
    return this.searchTerm;
  }
}
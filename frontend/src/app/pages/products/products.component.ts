import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/products.service';
import { SearchService } from '../../core/services/search.service';
import { Product } from '../../core/types/product';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/types/category';
import { CartService } from '../../core/services/cart.services';
import { AuthService } from '../../core/services/auth.service';
import { CreateProductComponent } from './create-product/create-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    CreateProductComponent,
    EditProductComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  Math = Math;
  
  allProducts: Product[] = []; 
  categories: Category[] = [];
  
  filteredProducts: Product[] = []; 
  
  selectedCategoryId: string | null = null;
  currentSearchTerm: string = '';
  
  total = 0;
  page = 1;
  limit = 12;

  showCreateModal = false;
  showEditModal = false;
  selectedProduct: Product | null = null;

  showDeleteModal = false;
  productToDelete: Product | null = null;
  
  constructor(
    private productService: ProductService,
    private searchService: SearchService,
    private categoryService: CategoryService,
    private cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    
    this.searchService.search$.subscribe((term) => {
      this.handleSearch(term);
    });
  }

  get isAdmin(): boolean {
    return this.authService.getRole() === 'admin';
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  openEditModal(product: Product): void {
    this.selectedProduct = product;
    this.showEditModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedProduct = null;
  }

   confirmDelete(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  onDeleteConfirmed(): void {
    if (this.productToDelete) {
      this.productService.delete(this.productToDelete.productId).subscribe({
        next: () => {
          this.onProductDeleted(this.productToDelete!.productId);
          this.closeDeleteModal();
        }
      });
    }
  }

  onProductCreated(product: Product): void {
    this.allProducts = [product, ...this.allProducts];
    
    if (!this.isCategoryMode || product.category?.categoryId === this.selectedCategoryId) {
      this.filteredProducts = [product, ...this.filteredProducts];
    }
    
    this.closeCreateModal();
  }

  onProductUpdated(updatedProduct: Product): void {
    this.allProducts = this.allProducts.map(p => 
      p.productId === updatedProduct.productId ? updatedProduct : p
    );
    
    this.filteredProducts = this.filteredProducts.map(p =>
      p.productId === updatedProduct.productId ? updatedProduct : p
    );
    
    if (this.isCategoryMode) {
      this.filteredProducts = this.filteredProducts.filter(p => 
        p.category?.categoryId === this.selectedCategoryId
      );
    }
    
    this.closeEditModal();
  }

  onProductDeleted(productId: string): void {
    this.allProducts = this.allProducts.filter(p => p.productId !== productId);
    this.filteredProducts = this.filteredProducts.filter(p => p.productId !== productId);
  }

  private filterProducts(): void {
    if (this.currentSearchTerm) {
      const searchLower = this.currentSearchTerm.toLowerCase().trim();
      this.filteredProducts = this.allProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower)
      );
    } else {
      this.filteredProducts = [...this.allProducts];
    }
  }

  loadProducts(page: number = 1) {
    const categoryId = this.isCategoryMode && this.selectedCategoryId 
      ? this.selectedCategoryId 
      : undefined;
    
    const actualLimit = this.isCategoryMode ? 1000 : this.limit;
    
    this.productService
      .getAll(
        page, 
        actualLimit, 
        categoryId, 
        ''
      )
      .subscribe((response) => {
        this.allProducts = response.data;
        this.filteredProducts = [...this.allProducts];
        this.total = response.total;
        this.page = response.page;
      });
  }
  
  handleSearch(term: string) {
    this.currentSearchTerm = term;
    
    if (term.trim() === '') {
      this.page = 1;
      this.loadProducts();
    } else {
      this.loadAllProductsForSearch(term);
    }
  }
  
  loadAllProductsForSearch(searchTerm: string) {
    const categoryId = this.isCategoryMode && this.selectedCategoryId 
      ? this.selectedCategoryId 
      : undefined;
    
    this.productService
      .getAll(
        1, 
        1000, 
        categoryId, 
        ''
      ) 
      .subscribe((response) => {
        this.allProducts = response.data;
        this.total = response.total;
        
        const searchLower = searchTerm.toLowerCase().trim();
        this.filteredProducts = this.allProducts.filter(product =>
          product.name.toLowerCase().includes(searchLower)
        );
      });
  }
  
  loadCategories() {
    this.categoryService.getAll().subscribe((categories) => {
      this.categories = categories;
    });
  }

  filterByCategory(categoryId: string | null) {
    this.selectedCategoryId = categoryId;
    this.page = 1;
    this.currentSearchTerm = '';
    this.searchService.clear();
    this.loadProducts();
  }

  addToCart(product: Product): void {
    if (product.stock > 0 && product.isActive) {
      this.cartService.addProduct(product);
      
      const btn = event?.target as HTMLElement;
      if (btn) {
        btn.textContent = '✓ Agregado';
        btn.classList.add('added');
        setTimeout(() => {
          btn.textContent = 'Agregar';
          btn.classList.remove('added');
        }, 1000);
      }
    }
  }
  
  nextPage() {
    if (!this.isCategoryMode && this.page * this.limit < this.total && !this.currentSearchTerm) {
      this.loadProducts(this.page + 1);
    }
  }

  prevPage() {
    if (!this.isCategoryMode && this.page > 1 && !this.currentSearchTerm) {
      this.loadProducts(this.page - 1);
    }
  }
  
  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.categoryId === categoryId);
    return category ? category.name : 'Desconocida';
  }
  
  get isCategoryMode(): boolean {
    return this.selectedCategoryId !== null;
  }
  
  get showPagination(): boolean {
    return !this.isCategoryMode && !this.currentSearchTerm && this.total > this.limit;
  }
}
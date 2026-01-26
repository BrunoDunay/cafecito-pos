import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductService } from '../../core/services/products.service';
import { SearchService } from '../../core/services/search.service';
import { Product } from '../../core/types/product';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/types/category';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  Math = Math;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategoryId: string | null = null;

  total = 0;
  page = 1;
  limit = 10;

  constructor(
    private productService: ProductService,
    private searchService: SearchService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();

    // Suscripción búsqueda global
    this.searchService.search$.subscribe((term) => {
      this.page = 1; // resetear página cuando se usa el buscador
      this.loadProducts(this.page, term);
    });
  }

  loadProducts(page: number = 1, searchTerm: string = '') {
    this.productService
      .getAll(page, this.limit, this.selectedCategoryId ?? undefined, searchTerm)
      .subscribe((response) => {
        this.products = response.data;
        this.filteredProducts = response.data;
        this.total = response.total;
        this.page = response.page;
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
    this.loadProducts(this.page, '');
  }

  nextPage() {
    if (this.page * this.limit < this.total) {
      this.loadProducts(this.page + 1, '');
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.loadProducts(this.page - 1, '');
    }
  }
}

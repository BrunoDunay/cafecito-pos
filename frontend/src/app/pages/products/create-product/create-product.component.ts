import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService, CreateProductDto, createProductSchema } from '../../../core/services/products.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/types/category';
import { Product } from '../../../core/types/product';
import z from 'zod';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() productCreated = new EventEmitter<Product>();

  productForm!: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      image: [''],
      category: ['', [Validators.required]],
      isActive: [true]
    });
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.productForm.value;
    
    const productData: CreateProductDto = {
      name: formValue.name.trim(),
      price: Number(formValue.price),
      stock: Number(formValue.stock),
      image: formValue.image || '',
      category: formValue.category,
      isActive: formValue.isActive
    };

    try {
      createProductSchema.parse(productData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errorMessage = error.issues[0]?.message || 'Error de validación';
        this.isLoading = false;
        return;
      }
    }

    this.productService.create(productData).subscribe({
      next: (product) => {
        this.productCreated.emit(product);
        this.onClose();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al crear el producto';
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}
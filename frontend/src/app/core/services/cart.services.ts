import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../types/product';
import { Customer } from '../types/customer';

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartState {
  items: CartItem[];
  customer: Customer | null;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // Estado del carrito usando signals
  private cartState = signal<CartState>({
    items: [],
    customer: null,
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    total: 0
  });

  // Exponer el estado con propiedades computadas
  readonly cart = computed(() => {
    const state = this.cartState();
    return {
      ...state,
      isEmpty: state.items.length === 0,
      itemsCount: state.items.reduce((total, item) => total + item.quantity, 0)
    };
  });

  constructor() {
    // Efecto que se ejecuta cuando cambia el cliente
    effect(() => {
      const customer = this.cartState().customer;
      const discountPercent = this.calculateAutoDiscount(customer);
      
      // Actualizar el descuento automáticamente
      if (discountPercent !== this.cartState().discountPercent) {
        this.updateCart({ discountPercent });
      }
    });
  }

  // Calcular descuento automático basado en las reglas de la rúbrica
  private calculateAutoDiscount(customer: Customer | null): number {
    if (!customer) return 0;
    
    const purchasesCount = customer.purchasesCount;
    
    // Reglas según la rúbrica
    if (purchasesCount === 0) return 0;         // Cliente nuevo
    if (purchasesCount >= 1 && purchasesCount <= 3) return 5;    // 1-3 compras
    if (purchasesCount >= 4 && purchasesCount <= 7) return 10;   // 4-7 compras
    if (purchasesCount >= 8) return 15;         // 8+ compras
    
    return 0;
  }

  // Agregar producto al carrito
  addProduct(product: Product, quantity: number = 1): void {
    const currentState = this.cartState();
    const existingItemIndex = currentState.items.findIndex(
      item => item.productId === product.productId
    );

    let newItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      newItems = [...currentState.items];
      const item = newItems[existingItemIndex];
      const newQuantity = item.quantity + quantity;
      
      // Validar stock
      if (newQuantity > product.stock) {
        throw new Error(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles.`);
      }
      
      newItems[existingItemIndex] = {
        ...item,
        quantity: newQuantity,
        lineTotal: newQuantity * item.unitPrice
      };
    } else {
      // Validar stock
      if (quantity > product.stock) {
        throw new Error(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles.`);
      }
      
      // Agregar nuevo item
      const newItem: CartItem = {
        productId: product.productId,
        product: product,
        quantity: quantity,
        unitPrice: product.price,
        lineTotal: product.price * quantity
      };
      newItems = [...currentState.items, newItem];
    }

    this.updateCart({ items: newItems });
  }

  // Actualizar cantidad de un producto
  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeProduct(productId);
      return;
    }

    const currentState = this.cartState();
    const item = currentState.items.find(item => item.productId === productId);
    
    if (!item) return;
    
    // Validar stock
    if (newQuantity > item.product.stock) {
      throw new Error(`Stock insuficiente. Solo hay ${item.product.stock} unidades disponibles.`);
    }

    const newItems = currentState.items.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQuantity,
          lineTotal: newQuantity * item.unitPrice
        };
      }
      return item;
    });

    this.updateCart({ items: newItems });
  }

  // Eliminar producto del carrito
  removeProduct(productId: string): void {
    const currentState = this.cartState();
    const newItems = currentState.items.filter(item => item.productId !== productId);
    this.updateCart({ items: newItems });
  }

  // Asignar cliente al carrito
  setCustomer(customer: Customer | null): void {
    // El descuento se calculará automáticamente en el effect
    this.updateCart({ customer });
  }

  // Aplicar descuento manual (por si se quiere override)
  applyDiscount(percent: number): void {
    this.updateCart({ discountPercent: percent });
  }

  // Actualizar el carrito y recalcular totales
  private updateCart(updates: Partial<CartState>): void {
    const currentState = this.cartState();
    let newState = { ...currentState, ...updates };

    // Si cambia el cliente, recalcular descuento automático
    if (updates.customer !== undefined) {
      newState.discountPercent = this.calculateAutoDiscount(updates.customer);
    }

    // Recalcular subtotal
    newState.subtotal = newState.items.reduce((sum, item) => sum + item.lineTotal, 0);

    // Recalcular descuento y total
    newState.discountAmount = (newState.subtotal * newState.discountPercent) / 100;
    newState.total = newState.subtotal - newState.discountAmount;

    this.cartState.set(newState);
  }

  // Limpiar carrito
  clearCart(): void {
    this.cartState.set({
      items: [],
      customer: null,
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      total: 0
    });
  }

  // Obtener descuento actual basado en cliente
  getCurrentDiscount(): number {
    return this.calculateAutoDiscount(this.cartState().customer);
  }

  // Verificar si hay stock suficiente para todos los items
  validateStock(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const items = this.cartState().items;
    
    items.forEach(item => {
      if (item.quantity > item.product.stock) {
        errors.push(`Stock insuficiente para ${item.product.name}. Disponible: ${item.product.stock}, Solicitado: ${item.quantity}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
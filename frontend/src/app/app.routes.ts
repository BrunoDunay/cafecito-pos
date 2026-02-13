import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Login
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
    title: 'Login',
  },

  // Layout principal
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/main/main.component').then((c) => c.MainComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products',
      },

      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products.component').then(
            (c) => c.ProductsComponent,
          ),
        title: 'Productos',
      },

      {
        path: 'customers',
        loadComponent: () =>
          import('./pages/customers/customers.component').then(
            (c) => c.CustomersComponent,
          ),
        title: 'Clientes',
      },

      {
        path: 'sales',
        loadComponent: () =>
          import('./pages/sales/sales.component').then((c) => c.SalesComponent),
        title: 'Ventas',
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./components/checkout/checkout.component').then(
            (c) => c.CheckoutComponent,
          ),
        title: 'Checkout',
      },

      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart.component').then((c) => c.CartComponent),
        title: 'Carrito',
      },

      {
        path: 'admin',
        loadChildren: () =>
          import('./pages/users/user.routes').then((m) => m.USER_ROUTES),
      },
    ],
  },
];

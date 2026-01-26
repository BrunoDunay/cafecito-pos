import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
    children: [

      {
        path: 'users',
        loadComponent: () =>
          import('./users.component').then(c => c.UsersComponent),
        title: 'Usuarios',
      },

      {
        path: 'users/create',
        loadComponent: () =>
          import('./create-user/create-user.component').then(
            c => c.CreateUserComponent
          ),
        title: 'Crear usuario',
      },

      {
        path: 'products/create',
        loadComponent: () =>
          import('../products/create-product/create-product.component').then(
            c => c.CreateProductComponent
          ),
        title: 'Crear producto',
      },

      {
        path: 'products/edit/:id',
        loadComponent: () =>
          import('../products/edit-product/edit-product.component').then(
            c => c.EditProductComponent
          ),
        title: 'Editar producto',
      },

    ],
  },
];

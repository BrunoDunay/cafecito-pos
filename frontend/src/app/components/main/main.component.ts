import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

import { CartComponent } from "../../pages/cart/cart.component";
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, RouterLink, CartComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent {
  constructor(private authService: AuthService) {}

  get isAdmin(): boolean {
    return this.authService.getRole() === 'admin';
  }
}

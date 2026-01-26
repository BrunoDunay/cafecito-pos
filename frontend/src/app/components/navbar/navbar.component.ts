import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private router: Router
  ) {}

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.setSearch(value);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get role() {
    return this.authService.getRole();
  }
}

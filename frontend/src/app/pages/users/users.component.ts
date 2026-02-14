import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserService, User } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SearchService } from '../../core/services/search.service';
import { CreateUserComponent } from './create-user/create-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    CreateUserComponent,
    EditUserComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  
  searchTerm: string = '';
  
  showCreateModal = false;
  showEditModal = false;
  selectedUser: User | null = null;

  showDeleteModal = false;
  userToDelete: User | null = null;

  private searchSubscription!: Subscription;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    // Suscribirse al servicio de búsqueda global
    this.searchSubscription = this.searchService.search$.subscribe((term) => {
      this.searchTerm = term;
      this.filterUsers();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.showEditModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  onDeleteConfirmed(): void {
    if (this.userToDelete) {
      this.userService.delete(this.userToDelete.userId).subscribe({
        next: () => {
          this.onUserDeleted(this.userToDelete!.userId);
          this.closeDeleteModal();
        }
      });
    }
  }

  onUserCreated(user: User): void {
    this.users = [user, ...this.users];
    this.filterUsers();
    this.closeCreateModal();
  }

  onUserUpdated(updatedUser: User): void {
    this.users = this.users.map(u => 
      u.userId === updatedUser.userId ? updatedUser : u
    );
    this.filterUsers();
    this.closeEditModal();
  }

  onUserDeleted(userId: string): void {
    this.users = this.users.filter(u => u.userId !== userId);
    this.filterUsers();
  }

  toggleActive(user: User): void {
    const newStatus = !user.isActive;
    this.userService.toggleActive(user.userId, newStatus).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map(u =>
          u.userId === updatedUser.userId ? updatedUser : u
        );
        this.filterUsers();
      }
    });
  }

  // Eliminamos el método onSearch ya que no lo necesitamos más

  private filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  getRoleBadgeColor(role: string): string {
    return role === 'admin' 
      ? 'bg-purple-400 text-white' 
      : 'bg-blue-500 text-white';
  }

  get isAdmin(): boolean {
    return this.authService.getRole() === 'admin';
  }
}
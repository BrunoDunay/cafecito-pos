import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, UpdateUserDto, updateUserSchema } from '../../../core/services/user.service';
import { User } from '../../../core/types/user';
import z from 'zod';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  @Input() user!: User;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<User>();

  userForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['seller', Validators.required],
      isActive: [true]
    });
  }

  private loadUserData(): void {
    if (this.user) {
      this.userForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        role: this.user.role,
        isActive: this.user.isActive
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.userForm.value;
    
    const userData: UpdateUserDto = {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      role: formValue.role,
      isActive: formValue.isActive
    };

    try {
      updateUserSchema.parse(userData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errorMessage = error.issues[0]?.message || 'Error de validación';
        this.isLoading = false;
        return;
      }
    }

    this.userService.update(this.user.userId, userData).subscribe({
      next: (user) => {
        this.userUpdated.emit(user);
        this.onClose();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al actualizar el usuario';
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}
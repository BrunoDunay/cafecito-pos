import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, CreateUserDto, createUserSchema } from '../../../core/services/user.service';
import z from 'zod';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<any>();

  userForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['seller', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.userForm.value;
    
    const userData: CreateUserDto = {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      password: formValue.password,
      role: formValue.role
    };

    try {
      createUserSchema.parse(userData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errorMessage = error.issues[0]?.message || 'Error de validación';
        this.isLoading = false;
        return;
      }
    }

    this.userService.create(userData).subscribe({
      next: (user) => {
        this.userCreated.emit(user);
        this.onClose();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al crear el usuario';
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
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html'
})
export class SuccessModalComponent {
  @Input() isVisible = false;
  @Input() title = '¡Éxito!';
  @Input() message = 'Operación completada correctamente';
  @Input() details = '';
}
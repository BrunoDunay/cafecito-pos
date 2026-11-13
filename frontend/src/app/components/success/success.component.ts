import { Component, Input, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'app-success',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './success.component.html'
})
export class SuccessModalComponent {
  @Input() isVisible = false;
  @Input() title = '¡Éxito!';
  @Input() message = 'Operación completada correctamente';
  @Input() details = '';
}
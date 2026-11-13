import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MainComponent } from "../../components/main/main.component";

@Component({
  selector: 'app-home',
  imports: [MainComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.css'
})
export class HomeComponent {

}

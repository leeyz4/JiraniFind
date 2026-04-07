import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToast } from './core/services/ui-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly uiToast = inject(UiToast);
}

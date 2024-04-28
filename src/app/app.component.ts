import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StatusService } from './service/status.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'kui';
  constructor(private statusService: StatusService) {}
}

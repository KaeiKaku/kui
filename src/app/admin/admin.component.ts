import { Component } from '@angular/core';
import { StatusService } from '../service/status.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  constructor(private statusService: StatusService) {}
}

import { Component, OnInit } from '@angular/core';
import { StatusService } from '../service/status.service';
import { AdminComponent } from '../admin/admin.component';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [AdminComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
})
export class IndexComponent implements OnInit {
  constructor(private statusService: StatusService) {}
  ngOnInit(): void {
    // this.statusService.getStatus$('x').subscribe(console.log);
  }
}

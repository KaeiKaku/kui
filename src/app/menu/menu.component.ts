import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StatusService } from '../service/status.service';
import { Observable } from 'rxjs';
import { ParseObjPipe } from '../pipe/parse-obj.pipe';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule, ParseObjPipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  readonly kui$!: Observable<Record<string, any>>;

  qabot_page_list: Record<string, any>[] = [];
  qabot_category_list: Record<string, any>[] = [];

  constructor(private readonly statusService: StatusService) {
    this.kui$ = this.statusService.get_status$('kui');
  }
  ngOnInit(): void {
    this.kui$.subscribe((kui) => {
      this.qabot_page_list = this.statusService.get_status_list(
        `qabot.${kui['current_page']}`
      );
      this.qabot_category_list = this.statusService.get_status_list(
        `qabot.${kui['current_page']}.category`
      );
    });
  }
}

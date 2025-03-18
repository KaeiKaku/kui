import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusService } from '../service/status.service';
import { RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ParseObjPipe } from '../pipe/parse-obj.pipe';

@Component({
  selector: 'app-home-message',
  imports: [RouterModule, CommonModule, ParseObjPipe],
  templateUrl: './home-message.component.html',
  styleUrl: './home-message.component.css',
})
export class HomeMessageComponent {
  readonly qabot_page_list: Record<string, any>[] = [];
  readonly kui$!: Observable<Record<string, any>>;
  readonly subscriptions$: Subscription = new Subscription();

  constructor(private readonly statusService: StatusService) {
    this.qabot_page_list = this.statusService.get_status_list('qabot');
    this.kui$ = this.statusService.get_status$('kui.name');
  }
}

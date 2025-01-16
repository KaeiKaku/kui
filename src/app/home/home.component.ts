import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatgptService } from '../service/chatgpt.service';
import { StatusService } from '../service/status.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  imports: [MenuComponent, ChatBoxComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  _queryFolders: string[] = [];
  subscriptions: Subscription = new Subscription();
  constructor(
    private readonly route: ActivatedRoute,
    private readonly chatgptService: ChatgptService,
    private readonly statusService: StatusService,
    private readonly titleService: Title
  ) {
    // init query params
    this.route.queryParams.subscribe((res) => {
      this._queryFolders = res['f'] ? res['f'] : [];
    });

    this.subscriptions.add(
      this.statusService.get_status().subscribe(console.log)
    );

    console.log(this._queryFolders);
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
  }
}

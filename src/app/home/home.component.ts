import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { HomeMessageComponent } from '../home-message/home-message.component';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatgptService } from '../service/chatgpt.service';
import { StatusService } from '../service/status.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  imports: [MenuComponent, HomeMessageComponent, ChatBoxComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  // queryFolders: string[] = [];
  private subscriptions: Subscription = new Subscription();
  constructor(
    private readonly route: ActivatedRoute,
    private readonly chatgptService: ChatgptService,
    private readonly statusService: StatusService,
    private readonly titleService: Title
  ) {
    // init query params
    // this.subscriptions.add(
    //   this.route.queryParams.subscribe((res) => {
    //     this.queryFolders = res['f'] ? res['f'] : [];
    //     console.log(this.queryFolders);
    //   })
    // );
    this.subscriptions.add(
      this.route.url.subscribe((segments) => {
        const [_current_page, _current_category] = segments.map(
          (segment) => segment.path
        );
        console.log(`url: ${_current_page}, ${_current_category}`);
        this.statusService.patch_status('kui', {
          current_page: _current_page,
          current_category: _current_category,
        });
      })
    );
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
  }
}

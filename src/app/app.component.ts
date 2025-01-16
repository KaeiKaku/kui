import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatgptService } from './service/chatgpt.service';
import { StatusService } from './service/status.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  _configLoaded: boolean = false;
  _is_checking_authorized: boolean = true;
  constructor(
    private readonly Chatgptservice: ChatgptService,
    private readonly statusService: StatusService
  ) {
    this.Chatgptservice.getConfig().subscribe((conf: any) => {
      this._is_checking_authorized = false;
      if (conf) {
        this.statusService.init_status(conf);
        this._configLoaded = true;
      }
    });
  }
}

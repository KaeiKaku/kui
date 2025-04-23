import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatgptService } from './service/chatgpt.service';
import { StatusService } from './service/status.service';
import { concatMap, map } from 'rxjs';

const ng_config = {
  kui: {
    name: 'QABot',
    render: {},
    selected: {},
  },
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  _configLoaded: boolean = false;
  _is_loading: boolean = true;
  constructor(
    private readonly Chatgptservice: ChatgptService,
    private readonly statusService: StatusService
  ) {
    this.Chatgptservice.get('configuration')
      .pipe(map((conf: any) => ({ ng_config, conf })))
      .subscribe(({ ng_config, conf }) => {
        this._is_loading = false;
        if (conf) {
          const merged_conf = Object.assign(ng_config, conf);
          this.statusService.init_status(merged_conf);
          this._configLoaded = true;
        }
      });
  }
}

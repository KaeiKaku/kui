import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { HomeMessageComponent } from '../home-message/home-message.component';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { ChatgptService } from '../service/chatgpt.service';
import { StatusService } from '../service/status.service';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MenuComponent,
    HomeMessageComponent,
    ChatBoxComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  display_homepage: boolean = false;
  query_folders: string[] = [];

  readonly render$!: Observable<Record<string, any>>;

  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly chatgptService: ChatgptService,
    private readonly statusService: StatusService
  ) {
    this.render$ = this.statusService.get_status$('kui.render');
  }

  ngOnInit(): void {
    // init query params
    this.subscriptions.add(
      this.route.queryParams.subscribe((res) => {
        this.query_folders = res['f'] ? res['f'] : [];
      })
    );
    // url change
    this.subscriptions.add(
      this.route.url
        .pipe(
          switchMap((segments) => {
            // reset selected
            this.statusService.patch_status('kui.selected', {
              selected_subfolders: [] as string[],
              category: null,
            });

            // home page
            if (segments.length == 0) {
              this.display_homepage = true;
              return EMPTY;
            }

            // not found
            const [segments_page, segments_category] = segments.map(
              (segment) => segment.path
            );
            const status_path = `qabot.${segments_page}${
              segments_category ? `.category.${segments_category}` : ''
            }`;
            const status = this.statusService.get_status_snapshot(status_path);
            if (status === undefined) {
              this.router.navigate(['/notfound']);
              return EMPTY;
            }

            // show chatpage
            this.display_homepage = false;

            // set title
            this.titleService.setTitle(`QABot  - ${segments_page}`);

            // set render status
            const category_dict = this.statusService.get_status_snapshot(
              `qabot.${segments_page}.category`
            );
            this.statusService.patch_status('kui.render', {
              page_title: this.statusService.get_status_snapshot(
                `qabot.${segments_page}.page_title`
              ),
              page: segments_page,
              category_dict: category_dict,
            });

            // general chat page
            if (segments_page == 'general') {
              this.statusService.patch_status('kui.selected', {
                category: this.statusService.get_status_snapshot(
                  'qabot.general.category'
                ),
                page: segments_page,
                selected_subfolders: [],
              });
              return EMPTY;
            }

            // set page
            this.statusService.patch_status('kui.selected', {
              page: segments_page,
            });

            // no category or loaded subfolders
            if (segments_category === undefined || '_sub_folders' in status) {
              return EMPTY;
            }

            // get category _sub_folders
            return this.chatgptService
              .post(status['api_suffix'], {
                folderSearch: true,
              })
              .pipe(
                map((api_response) => ({
                  api_response,
                  status,
                  segments_page,
                  segments_category,
                }))
              );
          })
        )
        .subscribe(
          ({ api_response, status, segments_page, segments_category }) => {
            // update render status
            this.statusService.patch_status(
              `kui.render.category_dict.${segments_category}`,
              {
                ...status,
                _sub_folders: api_response['sub_folders'],
                _sub_folders_length: api_response['sub_folders'].length,
              }
            );

            const selected_subfolders =
              this.query_folders.length > 0 ? this.query_folders : [];
            this.statusService.patch_status('kui.selected', {
              category: {
                [segments_category]: { ...status },
              },
              page: segments_page,
              selected_subfolders: selected_subfolders,
            });
          }
        )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
  }
}

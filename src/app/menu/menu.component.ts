import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatusService } from '../service/status.service';
import { Observable, Subscription } from 'rxjs';
import { ParseObjPipe } from '../pipe/parse-obj.pipe';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule, ParseObjPipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  providers: [ParseObjPipe],
  standalone: true,
})
export class MenuComponent implements OnInit {
  category_list: Record<string, any>[] = [];
  selected_subforlders: Map<string, boolean> = new Map<string, boolean>();

  readonly render$!: Observable<Record<string, any>>;
  readonly selected$!: Observable<Record<string, any>>;

  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly statusService: StatusService,
    private readonly parseObjPipe: ParseObjPipe
  ) {
    this.render$ = this.statusService.get_status$('kui.render');
    this.selected$ = this.statusService.get_status$('kui.selected');
  }

  ngOnInit(): void {
    // render page
    this.subscriptions.add(
      this.render$.subscribe((_) => {
        this.category_list = this.statusService.get_status_list(
          `kui.render.category_dict`
        );
      })
    );

    // subfolder selection
    this.subscriptions.add(
      this.selected$.subscribe((selected) => {
        if (!selected || !selected['category']) {
          this.selected_subforlders.clear();
          return;
        }

        const subfolders_obj = this.parseObjPipe.transform(
          selected['category']
        );

        const subfolders_set = new Set(selected['selected_subfolders']);
        for (const subfolder of subfolders_set) {
          this.selected_subforlders.set(subfolder as string, true);
        }
        for (const key of Array.from(this.selected_subforlders.keys())) {
          if (!subfolders_set.has(key)) {
            this.selected_subforlders.delete(key);
          }
        }

        const totalCount = subfolders_obj.value?._sub_folders?.length ?? 0;
        const selectedCount = this.selected_subforlders.size;
        const actualSelectedCount = this.selected_subforlders.has(
          `${subfolders_obj.key}_all_selected`
        )
          ? selectedCount - 1
          : selectedCount;
        if (actualSelectedCount === totalCount && totalCount > 0) {
          this.selected_subforlders.set(
            `${subfolders_obj.key}_all_selected`,
            true
          );
        } else {
          this.selected_subforlders.delete(
            `${subfolders_obj.key}_all_selected`
          );
        }
      })
    );
  }

  trackByFn(item: any) {
    return Object.keys(item)[0];
  }

  trackByFnSubfolder(item: any) {
    return item;
  }

  toggle_single(
    category: Record<string, any>,
    subfolders: string[],
    event: Event
  ) {
    const inputEl = event.target as HTMLInputElement;
    const selected_subfolders: string[] =
      this.statusService.get_status_snapshot(
        'kui.selected.selected_subfolders'
      ) ?? [];

    const updated_subfolders = inputEl.checked
      ? Array.from(new Set([...selected_subfolders, ...subfolders]))
      : selected_subfolders.filter((sub) => !subfolders.includes(sub));

    this.statusService.patch_status('kui.selected', {
      category: category,
      selected_subfolders: updated_subfolders,
    });
  }
}

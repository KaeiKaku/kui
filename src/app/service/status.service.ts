import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private _status: BehaviorSubject<Record<string, any>> | undefined;

  init_status(status_record: Record<string, any>): void {
    if (this._status) {
      throw new Error('StatusService has already been initialized.');
    }
    this._status = new BehaviorSubject(status_record);
  }

  get status(): Record<string, any> {
    if (!this._status) {
      throw new Error('StatusService has not been initialized yet.');
    }
    return JSON.parse(JSON.stringify(this._status.getValue()));
  }

  get_status(path?: string): Observable<Record<string, any>> {
    const source$ = this._status!.asObservable();

    if (!path) {
      return source$;
    }

    return source$.pipe(
      map((status: Record<string, any>) =>
        this._get_patch_value_bypath(status, path)
      ),
      distinctUntilChanged((prev, curr) =>
        typeof prev === 'object' && typeof curr === 'object'
          ? JSON.stringify(prev) === JSON.stringify(curr)
          : prev === curr
      )
    );
  }

  patch_status(path: string, patch_value: any) {
    const new_status = { ...this.status };
    this._get_patch_value_bypath(new_status, path, patch_value);
    if (JSON.stringify(new_status) !== JSON.stringify(this.status)) {
      this._status?.next(new_status);
    }
  }

  private _get_patch_value_bypath(
    status_record: Record<string, any>,
    path: string,
    updated_Status: any = undefined
  ): any | undefined {
    const paths = path.split('.');
    const str = paths.shift();
    // Handle invalid path or missing property, return undefined directly
    if (!str || !status_record.hasOwnProperty(str)) {
      return undefined;
    }
    // If the path is not yet complete, recursively process the next level
    if (paths.length > 0) {
      return this._get_patch_value_bypath(
        status_record[str],
        paths.join('.'),
        updated_Status
      );
    }
    // If there is an update status, handle the update logic
    if (updated_Status) {
      if (
        typeof status_record[str] === 'object' &&
        typeof updated_Status === 'object'
      ) {
        // Validate all keys in the update status exist in the target object
        for (const key of Object.keys(updated_Status)) {
          if (!(key in status_record[str])) {
            throw new Error(
              `Property ${key} does not exist on the target object`
            );
          }
        }
        // Merge objects if validation passes
        status_record[str] = { ...status_record[str], ...updated_Status };
      } else {
        // If the target is not an object, overwrite directly
        status_record[str] = updated_Status;
      }
    } else {
      // If no update status is provided, return the target value
      return status_record[str];
    }
  }
}

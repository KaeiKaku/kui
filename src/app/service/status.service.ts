import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  first,
  map,
} from 'rxjs';

type StrictType = string | number | boolean;

export interface StatusObject {
  [key: string]: StatusObject | StrictType | StrictType[] | StatusObject[];
}

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private readonly _status: Map<string, BehaviorSubject<StatusObject>> =
    new Map();

  initStatus(key: string, status: StatusObject): void {
    if (this._status.has(key)) {
      throw new Error('Status existed.');
    }
    this._status.set(key, new BehaviorSubject(status));
  }

  getStatusSnapshot(key: string, path?: string): StatusObject | undefined {
    if (!this._status.has(key)) {
      throw new Error('Status not exist.');
    }
    let resStatus: StatusObject | undefined;
    if (path) {
      this._status
        .get(key)!
        .pipe(first())
        .subscribe((_) => {
          const segmentStatus = this._fnGetValueByPath(_, path);
          if (segmentStatus) {
            resStatus = JSON.parse(JSON.stringify(segmentStatus));
          }
        });
    } else {
      this._status
        .get(key)!
        .pipe(first())
        .subscribe((_) => {
          resStatus = JSON.parse(JSON.stringify(_));
        });
    }
    return resStatus;
  }

  getStatus$(key: string, path?: string): Observable<StatusObject> {
    if (!this._status.has(key)) {
      throw new Error('Status not exist.');
    }
    return this._status.get(key)!.pipe(
      map((_) => {
        const clone = JSON.parse(JSON.stringify(_));
        if (path) {
          const segmentStatus = this._fnGetValueByPath(clone, path);
          if (segmentStatus) {
            return segmentStatus;
          } else {
            throw new Error('Incorrect status path.');
          }
        } else {
          return clone;
        }
      }),
      distinctUntilChanged((previous, current) => {
        if (typeof previous === 'object' && typeof current === 'object') {
          return this._fnDeepCompareObject(previous, current);
        } else {
          return previous == current;
        }
      })
    );
  }

  patchStatus(
    key: string,
    patchFn: (status: StatusObject) => StatusObject | StrictType,
    path?: string,
    callback?: Function
  ): void {
    let updatedStatus: StatusObject;
    const currentStatus = this.getStatusSnapshot(key);
    if (path) {
      const segmentStatus = this._fnGetValueByPath(currentStatus, path);
      if (segmentStatus) {
        const updatedSegmentStatus = patchFn(segmentStatus);
        this._fnGetValueByPath(currentStatus, path, updatedSegmentStatus);
        updatedStatus = currentStatus!;
      } else {
        throw new Error('Incorrect status path.');
      }
    } else {
      updatedStatus = patchFn(currentStatus!) as StatusObject;
    }
    // patch
    if (
      Object.keys(currentStatus!).every((key) =>
        Object.keys(updatedStatus).includes(key)
      )
    ) {
      this._status.get(key)!.next(updatedStatus as StatusObject);
      callback && callback();
    } else {
      throw new Error('The status to be updated is incomplete.');
    }
  }

  fnAddStatusOption(
    status: StatusObject,
    option: { [key: string]: any }
  ): StatusObject {
    if (status) {
      for (const key in status) {
        const _ = status[key] as StatusObject;
        if (typeof _ === 'object') {
          this.fnAddStatusOption(_, option);
        } else {
          status[key] = {
            value: _,
            ...option,
          };
        }
      }
    }
    return status;
  }

  private _fnIsObject(object: any): boolean {
    return object !== null && typeof object === 'object';
  }

  private _fnGetValueByPath(
    status: any,
    path: string,
    updatedSegmentStatus: StatusObject | StrictType | undefined = undefined
  ): any | undefined {
    const paths = path.split('.');
    const str = paths.shift();
    if (str && status.hasOwnProperty(str)) {
      if (paths.length > 0) {
        return this._fnGetValueByPath(
          status[str],
          paths.join('.'),
          updatedSegmentStatus
        );
      } else {
        if (updatedSegmentStatus) {
          status[str] = updatedSegmentStatus;
        } else {
          return status[str];
        }
      }
    } else {
      return undefined;
    }
  }

  private _fnDeepCompareObject(t: any, u: any): boolean {
    if (t === u) {
      return true;
    }

    if (!this._fnIsObject(t) || !this._fnIsObject(u)) {
      return false;
    }

    const keyst = Object.keys(t);
    const keysu = Object.keys(u);

    if (keyst.length != keysu.length) {
      return false;
    }

    for (const key of keyst) {
      if (!keysu.includes(key)) {
        return false;
      }

      const valt = t[key];
      const valu = u[key];
      const bothObject = this._fnIsObject(valt) && this._fnIsObject(valu);

      if (
        (bothObject && !this._fnDeepCompareObject(valt, valu)) ||
        (!bothObject && valt !== valu)
      ) {
        return false;
      }
    }

    return true;
  }
}

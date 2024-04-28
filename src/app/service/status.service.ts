import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  first,
  map,
} from 'rxjs';

export type StrictType = string | number | boolean;
export interface StatusObject {
  [key: string]: StatusObject | StrictType | StrictType[] | StatusObject[];
}
export class Functor<T> {
  constructor(value: T) {
    this._value = value;
  }

  static of<T>(value: T) {
    return new Functor<T>(value);
  }

  private _value: T;

  private _isNothing(): boolean {
    return this._value === null || this._value === undefined;
  }

  public join(): T {
    return this._value;
  }

  public map<U>(fn: (param: T) => U) {
    if (this._isNothing()) return Functor.of(undefined);
    return Functor.of(fn(this._value));
  }

  public flatMap<U>(fn: (param: T) => U) {
    if (this._isNothing()) return Functor.of(undefined);
    return Functor.of(fn(this._value)).join();
  }
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

  getStatus$(key: string, path?: string): Observable<StatusObject> {
    if (!this._status.has(key)) {
      throw new Error('Status not exist.');
    }
    return this._status.get(key)!.pipe(
      map((_) => {
        const clone = JSON.parse(JSON.stringify(_));
        if (path && this.fnGetValueByPath(clone, path)) {
          return this.fnGetValueByPath(clone, path);
        } else {
          return clone;
        }
      }),
      distinctUntilChanged((previous, current) => {
        if (typeof previous === 'object' && typeof current === 'object') {
          return this.fnDeepCompareObject(previous, current);
        } else {
          return previous == current;
        }
      })
    );
  }

  patchStatus(
    key: string,
    patchFn: (status: StatusObject) => StatusObject,
    callback?: Function
  ): void {
    this.getStatus$(key)
      .pipe(first())
      .subscribe((currentStatus: StatusObject) => {
        const updatedStatus = patchFn(currentStatus);
        if (
          typeof updatedStatus === 'object' &&
          typeof currentStatus === 'object'
        ) {
          if (
            Object.keys(currentStatus).every((key) =>
              Object.keys(updatedStatus).includes(key)
            )
          ) {
            this._status.get(key)!.next(updatedStatus);
            callback && callback();
          } else {
            throw new Error('The status being updated is incomplete.');
          }
        } else {
          this._status.get(key)!.next(updatedStatus);
          if (callback) callback();
        }
      });
  }

  fnGetValueByPath(status: any, path: string): any | undefined {
    const paths = path.split('.');
    const str = paths.shift();
    if (str && status.hasOwnProperty(str)) {
      if (paths.length > 0) {
        return this.fnGetValueByPath(status[str], paths.join('.'));
      } else {
        return status[str];
      }
    } else {
      return undefined;
    }
  }

  fnDeepCompareObject(t: any, u: any): boolean {
    if (t === u) {
      return true;
    }

    if (!this.fnIsObject(t) || !this.fnIsObject(u)) {
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
      const bothObject = this.fnIsObject(valt) && this.fnIsObject(valu);

      if (
        (bothObject && !this.fnDeepCompareObject(valt, valu)) ||
        (!bothObject && valt !== valu)
      ) {
        return false;
      }
    }

    return true;
  }

  fnIsObject(object: any): boolean {
    return object !== null && typeof object === 'object';
  }
}

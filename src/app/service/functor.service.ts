import { Injectable } from '@angular/core';

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
export class FunctorService {
  constructor() {}
}

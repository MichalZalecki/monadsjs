import * as deepEqual from "deep-equal";

export interface Comonad<T> {
  extract(): T;
}

export class Identity<T> implements Comonad<T> {
  public static unit<T>(value: T) {
    return new Identity<T>(value);
  }

  constructor(private _value: T) {}

  public bind<U>(transform: (value: T) => Identity<U>): Identity<U> {
    return transform(this._value);
  }

  public map<U>(transform: (value: T) => U): Identity<U> {
    return Identity.unit(transform(this._value));
  }

  public extract(): T {
    return this._value;
  }

  public toString() {
    return `Identity(${JSON.stringify(this._value)})`;
  }
}

export class Just<T> {
  public static unit<T>(value: T) {
    return new Just<T>(value);
  }

  constructor(private _value: T) {}

  public bind<U>(transform: (value: T) => Just<U> | Nothing<U>): Just<U> | Nothing<U> {
    try {
      return transform(this._value);
    } catch (err) {
      return new Nothing();
    }
  }

  public map<U>(transform: (value: T) => U): Just<U> | Nothing<U> {
    try {
      return Just.unit(transform(this._value));
    } catch (err) {
      return new Nothing();
    }
  }

  public toString() {
    return `Just(${JSON.stringify(this._value)})`;
  }
}

export class Nothing<T> {
  public static unit<T>() {
    return new Nothing<T>();
  }

  public bind<U>(transform: (value: T) => Just<U> | Nothing<U>): Just<U> | Nothing<U> {
    return new Nothing();
  }

  public map<U>(transform: (value: T) => U): Just<U> | Nothing<U> {
    return new Nothing();
  }

  public toString() {
    return `Nothing()`;
  }
}

export type Maybe<T> = Just<T> | Nothing<T>;

export class Right<T> {
  public static unit<T>(value: T) {
    return new Right<T>(value);
  }

  constructor(private _value: T) {}

  public bind<U>(transform: (value: T) => Right<U> | Left<U>): Right<U> | Left<U> {
    try {
      return transform(this._value);
    } catch (err) {
      return Left.unit(err);
    }
  }

  public map<U>(transform: (value: T) => U): Right<U> | Left<U> {
    try {
      return Right.unit(transform(this._value));
    } catch (err) {
      return Left.unit(err);
    }
  }

  public toString() {
    return `Right(${JSON.stringify(this._value)})`;
  }
}

export class Left<T> {
  public static unit<T>(value: T) {
    return new Left<T>(value);
  }

  constructor(private _value: T) {}

  public bind<U>(transform: (value: T) => Right<U> | Left<U>): Left<U> {
    return this;
  }

  public map<U>(transform: (value: T) => U): Left<U> {
    return this;
  }

  public toString() {
    return `Left(${this._value})`;
  }
}

export type Either<T> = Right<T> | Left<T>

export type IOSideEffect = (...params: any[]) => void;

export class IO {
  public static unit(effect: IOSideEffect, ...params: any[]) {
    return new IO(effect, ...params);
  }

  public _params: any[];

  constructor(public _effect: IOSideEffect, ..._params: any[]) {
    this._params = _params;
  }

  public bind(transform: (effect: IOSideEffect, ...params: any[]) => IO): IO {
    return transform(this._effect, ...this._params);
  }

  public run() {
    this._effect(...this._params);
  }

  public equals(io: IO) {
    return deepEqual([this._effect, this._params], [io._effect, io._params]);
  }

  public toString() {
    // TODO: Come up with sth better
    return `IO(${this._effect.name}, ${JSON.stringify(this._params)})`;
  }
}

export class Continuation {
  public static unit(value: any) {
    return new Continuation(value);
  }

  private _value: Promise<any>;

  constructor(value: any) {
    this._value = Promise.resolve(value);
  }

  public bind(transform: (value: any) => any): Continuation {
    return Continuation.unit(this._value.then(transform));
  }

  public toString() {
    return `Continuation(${this._value})`;
  }
}

function *lazyMap<T, U>(iterable: Iterable<T>, transform: (elem: T) => U) {
  for (let elem of iterable) {
    yield transform(elem);
  }
}

export class List<T> {
  public static unit<T>(value: Iterable<T>) {
    return new List<T>(value);
  }

  constructor(private _value: Iterable<T>) {}

  public bind<U>(transform: (iterable: Iterable<T>) => List<U>): List<U> {
    return transform(this._value);
  }

  public map<U>(transform: (elem: T) => U): List<U> {
    return List.unit(lazyMap(this._value, transform));
  }

  public forEach(subscribe: (elem: T) => void): void {
    for (let elem of this._value) {
      subscribe(elem);
    }
  }

  public *[Symbol.iterator]() {
    yield* this._value;
  }

  public toString() {
    return `List(${JSON.stringify(this._value)})`;
  }
}

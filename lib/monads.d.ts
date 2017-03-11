export interface Comonad<T> {
    extract(): T;
}
export declare class Identity<T> implements Comonad<T> {
    private _value;
    static unit<T>(value: T): Identity<T>;
    constructor(_value: T);
    bind<U>(transform: (value: T) => Identity<U>): Identity<U>;
    map<U>(transform: (value: T) => U): Identity<U>;
    extract(): T;
    toString(): string;
}
export declare class Just<T> {
    private _value;
    static unit<T>(value: T): Just<T>;
    constructor(_value: T);
    bind<U>(transform: (value: T) => Just<U> | Nothing<U>): Just<U> | Nothing<U>;
    map<U>(transform: (value: T) => U): Just<U> | Nothing<U>;
    toString(): string;
}
export declare class Nothing<T> {
    static unit<T>(): Nothing<T>;
    bind<U>(transform: (value: T) => Just<U> | Nothing<U>): Just<U> | Nothing<U>;
    map<U>(transform: (value: T) => U): Just<U> | Nothing<U>;
    toString(): string;
}
export declare type Maybe<T> = Just<T> | Nothing<T>;
export declare class Right<T> {
    private _value;
    static unit<T>(value: T): Right<T>;
    constructor(_value: T);
    bind<U>(transform: (value: T) => Right<U> | Left<U>): Right<U> | Left<U>;
    map<U>(transform: (value: T) => U): Right<U> | Left<U>;
    toString(): string;
}
export declare class Left<T> {
    private _value;
    static unit<T>(value: T): Left<T>;
    constructor(_value: T);
    bind<U>(transform: (value: T) => Right<U> | Left<U>): Left<U>;
    map<U>(transform: (value: T) => U): Left<U>;
    toString(): string;
}
export declare type Either<T> = Right<T> | Left<T>;
export declare type IOSideEffect = (...params: any[]) => void;
export declare class IO {
    _effect: IOSideEffect;
    static unit(effect: IOSideEffect, ...params: any[]): IO;
    _params: any[];
    constructor(_effect: IOSideEffect, ..._params: any[]);
    bind(transform: (effect: IOSideEffect, ...params: any[]) => IO): IO;
    run(): void;
    equals(io: IO): boolean;
    toString(): string;
}
export declare class Continuation {
    static unit(value: any): Continuation;
    private _value;
    constructor(value: any);
    bind(transform: (value: any) => any): Continuation;
    toString(): string;
}
export declare class List<T> {
    private _value;
    static unit<T>(value: Iterable<T>): List<T>;
    constructor(_value: Iterable<T>);
    bind<U>(transform: (iterable: Iterable<T>) => List<U>): List<U>;
    map<U>(transform: (elem: T) => U): List<U>;
    forEach(subscribe: (elem: T) => void): void;
    [Symbol.iterator](): IterableIterator<T>;
    toString(): string;
}

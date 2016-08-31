export declare class Identity<T> {
    private _value;
    static of: typeof Identity.unit;
    static unit<T>(value: T): Identity<T>;
    constructor(_value: T);
    bind<U>(transform: (value: T) => Identity<U>): Identity<U>;
    map<U>(transform: (value: T) => U): Identity<U>;
    toString(): string;
}
export declare class Just<T> {
    private _value;
    static of: typeof Just.unit;
    static unit<T>(value: T): Just<T>;
    constructor(_value: T);
    bind<U>(transform: (value: T) => Just<U> | Nothing): Just<U> | Nothing;
    map<U>(transform: (value: T) => U): Just<U> | Nothing;
    toString(): string;
}
export declare class Nothing {
    static of: typeof Nothing.unit;
    static unit(): Nothing;
    bind<U>(transform: (value: any) => Just<U> | Nothing): Nothing;
    map<U>(transform: (value: any) => U): Nothing;
    toString(): string;
}
export declare type Maybe<T> = Just<T> | Nothing;
export declare type IOSideEffect = () => void;
export declare class IO {
    private _value;
    static of: typeof IO.unit;
    static unit(value: IOSideEffect): IO;
    constructor(_value: IOSideEffect);
    bind(transform: (value: IOSideEffect) => IO): IO;
    run(): void;
    toString(): string;
}
export declare class Right<T> {
    private _value;
    static of: typeof Right.unit;
    static unit<T>(value: T): Right<T>;
    constructor(_value: T);
    bind<U>(transform: (value: T) => Right<U> | Left<U>): Right<U> | Left<U>;
    map<U>(transform: (value: T) => U): Right<U> | Left<U>;
    toString(): string;
}
export declare class Left<T> {
    private _value;
    static of: typeof Left.unit;
    static unit<T>(value: T): Left<T>;
    constructor(_value: T);
    bind<U>(transform: (value: T) => Right<U> | Left<U>): Left<T>;
    map<U>(transform: (value: T) => U): Left<T>;
    toString(): string;
}
export declare type Either<T> = Right<T> | Left<T>;
export declare class Continuation {
    static of: typeof Continuation.unit;
    static unit(value: any): Continuation;
    private _value;
    constructor(value: any);
    bind(transform: (value: any) => any): Continuation;
    toString(): string;
}
export declare class List<T> {
    private _value;
    static of: typeof List.unit;
    static unit<T>(value: Iterable<T>): List<T>;
    constructor(_value: Iterable<T>);
    bind<U>(transform: (iterable: Iterable<T>) => List<U>): List<U>;
    map<U>(transform: (elem: T) => U): List<U>;
    [Symbol.iterator](): IterableIterator<T>;
    toString(): string;
}

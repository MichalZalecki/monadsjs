"use strict";
class Identity {
    constructor(_value) {
        this._value = _value;
    }
    static unit(value) {
        return new Identity(value);
    }
    bind(transform) {
        return transform(this._value);
    }
    map(transform) {
        return Identity.unit(transform(this._value));
    }
    toString() {
        return `Identity(${JSON.stringify(this._value)})`;
    }
}
Identity.of = Identity.unit;
exports.Identity = Identity;
class Just {
    constructor(_value) {
        this._value = _value;
    }
    static unit(value) {
        return new Just(value);
    }
    bind(transform) {
        try {
            return transform(this._value);
        }
        catch (err) {
            return new Nothing();
        }
    }
    map(transform) {
        try {
            return Just.unit(transform(this._value));
        }
        catch (err) {
            return new Nothing();
        }
    }
    toString() {
        return `Just(${JSON.stringify(this._value)})`;
    }
}
Just.of = Just.unit;
exports.Just = Just;
class Nothing {
    static unit() {
        return new Nothing();
    }
    bind(transform) {
        return this;
    }
    map(transform) {
        return this;
    }
    toString() {
        return "Nothing()";
    }
}
Nothing.of = Nothing.unit;
exports.Nothing = Nothing;
class IO {
    constructor(_value) {
        this._value = _value;
    }
    static unit(value) {
        return new IO(value);
    }
    bind(transform) {
        return transform(this._value);
    }
    run() {
        this._value();
    }
    toString() {
        // TODO: Come up with sth better
        return "IO(IOSideEffect)";
    }
}
IO.of = IO.unit;
exports.IO = IO;
class Right {
    constructor(_value) {
        this._value = _value;
    }
    static unit(value) {
        return new Right(value);
    }
    bind(transform) {
        try {
            return transform(this._value);
        }
        catch (err) {
            return Left.unit(err);
        }
    }
    map(transform) {
        try {
            return Right.unit(transform(this._value));
        }
        catch (err) {
            return Left.unit(err);
        }
    }
    toString() {
        return `Right(${JSON.stringify(this._value)})`;
    }
}
Right.of = Right.unit;
exports.Right = Right;
class Left {
    constructor(_value) {
        this._value = _value;
    }
    static unit(value) {
        return new Left(value);
    }
    bind(transform) {
        return this;
    }
    map(transform) {
        return this;
    }
    toString() {
        return `Left(${this._value})`;
    }
}
Left.of = Left.unit;
exports.Left = Left;
class Continuation {
    constructor(value) {
        this._value = Promise.resolve(value);
    }
    static unit(value) {
        return new Continuation(value);
    }
    bind(transform) {
        return Continuation.of(this._value.then(transform));
    }
    toString() {
        return `Continuation(${this._value})`;
    }
}
Continuation.of = Continuation.unit;
exports.Continuation = Continuation;
function* lazyMap(iterable, transform) {
    for (let elem of iterable) {
        yield transform(elem);
    }
}
class List {
    constructor(_value) {
        this._value = _value;
    }
    static unit(value) {
        return new List(value);
    }
    bind(transform) {
        return transform(this._value);
    }
    map(transform) {
        return List.of(lazyMap(this._value, transform));
    }
    // TODO: Implement forEach
    *[Symbol.iterator]() {
        yield* this._value;
    }
    toString() {
        return `List(${JSON.stringify(this._value)})`;
    }
}
List.of = List.unit;
exports.List = List;
//# sourceMappingURL=monads.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deepEqual = require("deep-equal");
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
    extract() {
        return this._value;
    }
    toString() {
        return `Identity(${JSON.stringify(this._value)})`;
    }
}
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
exports.Just = Just;
class Nothing {
    static unit() {
        return new Nothing();
    }
    bind(transform) {
        return new Nothing();
    }
    map(transform) {
        return new Nothing();
    }
    toString() {
        return `Nothing()`;
    }
}
exports.Nothing = Nothing;
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
exports.Left = Left;
class IO {
    constructor(_effect, ..._params) {
        this._effect = _effect;
        this._params = _params;
    }
    static unit(effect, ...params) {
        return new IO(effect, ...params);
    }
    bind(transform) {
        return transform(this._effect, ...this._params);
    }
    run() {
        this._effect(...this._params);
    }
    equals(io) {
        return deepEqual([this._effect, this._params], [io._effect, io._params]);
    }
    toString() {
        // TODO: Come up with sth better
        return `IO(${this._effect.name}, ${JSON.stringify(this._params)})`;
    }
}
exports.IO = IO;
class Continuation {
    static unit(value) {
        return new Continuation(value);
    }
    constructor(value) {
        this._value = Promise.resolve(value);
    }
    bind(transform) {
        return Continuation.unit(this._value.then(transform));
    }
    toString() {
        return `Continuation(${this._value})`;
    }
}
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
        return List.unit(lazyMap(this._value, transform));
    }
    forEach(subscribe) {
        for (let elem of this._value) {
            subscribe(elem);
        }
    }
    *[Symbol.iterator]() {
        yield* this._value;
    }
    toString() {
        return `List(${JSON.stringify(this._value)})`;
    }
}
exports.List = List;
//# sourceMappingURL=monads.js.map
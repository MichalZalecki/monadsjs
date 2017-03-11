"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const sinon = require("sinon");
const monads_1 = require("../lib/monads");
// Identity
ava_1.default("Identity.unit(a) is new Identity(a) shorthand", t => {
    t.deepEqual(monads_1.Identity.unit("foo"), new monads_1.Identity("foo"));
});
ava_1.default("Identity.unit is an Identity.unit alias", t => {
    t.deepEqual(monads_1.Identity.unit("foo"), monads_1.Identity.unit("foo"));
});
ava_1.default("Identity.bind allows for chaining transformations", t => {
    const actual = monads_1.Identity.unit("foo")
        .bind(str => monads_1.Identity.unit(str.length))
        .bind(len => monads_1.Identity.unit(len * 2));
    t.deepEqual(actual, monads_1.Identity.unit(6));
});
ava_1.default("Identity.map allows for chaining underlaying value transformations", t => {
    const actual = monads_1.Identity.unit("foo")
        .map(str => str.length)
        .map(len => len * 2);
    t.deepEqual(actual, monads_1.Identity.unit(6));
});
ava_1.default("Identity implements Comonad", t => {
    t.is(monads_1.Identity.unit("Comonad").extract(), "Comonad");
});
ava_1.default("Identity implements .toString() method", t => {
    t.is(monads_1.Identity.unit(6).toString(), "Identity(6)");
    t.is(monads_1.Identity.unit("foo").toString(), "Identity(\"foo\")");
    t.is(monads_1.Identity.unit(["foo", 6]).toString(), "Identity([\"foo\",6])");
});
ava_1.default("Identity obey monad laws", t => {
    const f = (word) => monads_1.Identity.unit(word.length);
    const g = (len) => monads_1.Identity.unit(len * 2);
    const m = monads_1.Identity.unit("foo");
    t.deepEqual(monads_1.Identity.unit("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Identity.unit), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Just
ava_1.default("Just.unit(a) is new Just(a) shorthand", t => {
    t.deepEqual(monads_1.Just.unit("foo"), new monads_1.Just("foo"));
});
ava_1.default("Just.bind returns Nothing in case of exception", t => {
    function firstWordLength(words) {
        return words[0].length;
    }
    const m = monads_1.Just.unit([])
        .bind(strs => monads_1.Just.unit(firstWordLength(strs)));
    t.deepEqual(m, new monads_1.Nothing());
});
ava_1.default("Just.map returns Nothing in case of exception", t => {
    function firstWordLength(words) {
        return words[0].length;
    }
    const m = monads_1.Just.unit([])
        .map(strs => firstWordLength(strs));
    t.deepEqual(m, new monads_1.Nothing());
});
ava_1.default("Just implements .toString() method", t => {
    t.is("Just(6)", monads_1.Just.unit(6).toString());
    t.is("Just(\"foo\")", monads_1.Just.unit("foo").toString());
    t.is("Just([\"foo\",6])", monads_1.Just.unit(["foo", 6]).toString());
});
ava_1.default("Just obey monad laws", t => {
    const f = (word) => monads_1.Just.unit(word.length);
    const g = (len) => monads_1.Just.unit(len * 2);
    const m = monads_1.Just.unit("foo");
    t.deepEqual(monads_1.Just.unit("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Just.unit), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Nothing
ava_1.default("Nothing.unit() is new Nothing() shorthand", t => {
    t.deepEqual(monads_1.Nothing.unit(), new monads_1.Nothing());
});
ava_1.default("Nothing.unit is an Nothing.unit alias", t => {
    t.deepEqual(monads_1.Nothing.unit(), monads_1.Nothing.unit());
});
ava_1.default("Nothing implements .toString() method", t => {
    t.is("Nothing()", monads_1.Nothing.unit().toString());
});
ava_1.default("Nothing obey monad laws", t => {
    const f = (word) => monads_1.Just.unit(word.length);
    const f1 = (word) => monads_1.Nothing.unit();
    const g = (len) => monads_1.Just.unit(len * 2);
    const m = monads_1.Nothing.unit();
    t.deepEqual(monads_1.Nothing.unit().bind(f1), f1("foo"));
    t.deepEqual(m.bind(monads_1.Just.unit), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Maybe
ava_1.default("Maybe when is Just allows for chaining transformations", t => {
    const doubleFirstWordLength = monads_1.Just.unit(["foo", "bar", "foo"])
        .bind(words => words[0] ? monads_1.Just.unit(words[0]) : new monads_1.Nothing())
        .bind(word => monads_1.Just.unit(word.length))
        .bind(len => monads_1.Just.unit(len * 2));
    t.true(doubleFirstWordLength instanceof monads_1.Just);
    t.is(doubleFirstWordLength.toString(), "Just(6)");
});
ava_1.default("Maybe when is Nothing skips chained transformations", t => {
    const doubleFirstWordLength = monads_1.Just.unit([])
        .bind(words => words[0] ? monads_1.Just.unit(words[0]) : new monads_1.Nothing())
        .bind(word => monads_1.Just.unit(word.length))
        .bind(len => monads_1.Just.unit(len * 2));
    t.true(doubleFirstWordLength instanceof monads_1.Nothing);
    t.is(doubleFirstWordLength.toString(), "Nothing()");
});
// IO
ava_1.default("IO.unit(IOSideEffect) is new IO(IOSideEffect) shorthand", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    t.deepEqual(monads_1.IO.unit(sideEffect), new monads_1.IO(sideEffect));
});
ava_1.default("IO.unit is an IO.unit alias", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    t.deepEqual(monads_1.IO.unit(sideEffect), monads_1.IO.unit(sideEffect));
});
ava_1.default("IO.bind allows for chaining side effects", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    const anotherSideEffect = () => { alert("I'm an another side effect!"); };
    const actual = monads_1.IO.unit(sideEffect)
        .bind(() => monads_1.IO.unit(anotherSideEffect));
    t.deepEqual(actual, monads_1.IO.unit(anotherSideEffect));
});
ava_1.default("IO implements .toString() method", t => {
    const sideEffect = name => { alert(`Hello ${name}! I'm a side effect!`); };
    t.is(monads_1.IO.unit(sideEffect, "World").toString(), "IO(sideEffect, [\"World\"])");
});
ava_1.default("IO.equals check IO monads deep quality", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    const anotherSideEffect = () => { alert("I'm a another side effect!"); };
    const m1 = monads_1.IO.unit(sideEffect, 1, 2, 3);
    t.true(m1.equals(monads_1.IO.unit(sideEffect, 1, 2, 3)));
    t.false(m1.equals(monads_1.IO.unit(sideEffect, 1, 2)));
    t.false(m1.equals(monads_1.IO.unit(anotherSideEffect, 1, 2, 3)));
});
ava_1.default("IO can run() side effect", t => {
    const sideEffectSpy = sinon.spy();
    monads_1.IO.unit(sideEffectSpy, 101).run();
    t.true(sideEffectSpy.calledWith(101));
});
ava_1.default("IO obey monad laws", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    const anotherSideEffect = () => { alert("I'm an another side effect!"); };
    const yetAnotherSideEffect = () => { alert("I'm a yet another side effect!"); };
    const f = (sf) => monads_1.IO.unit(sideEffect);
    const g = (sf) => monads_1.IO.unit(anotherSideEffect);
    const m = monads_1.IO.unit(yetAnotherSideEffect);
    t.deepEqual(monads_1.IO.unit(sideEffect).bind(f), f(sideEffect));
    t.deepEqual(m.bind(monads_1.IO.unit), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Right
ava_1.default("Right.unit(a) is new Right(a) shorthand", t => {
    t.deepEqual(monads_1.Right.unit("foo"), new monads_1.Right("foo"));
});
ava_1.default("Right.unit is an Right.unit alias", t => {
    t.deepEqual(monads_1.Right.unit("foo"), monads_1.Right.unit("foo"));
});
ava_1.default("Right.bind returns Left in case of exception", t => {
    function firstWordLength(words) {
        return words[0].length;
    }
    const m = monads_1.Right.unit([])
        .bind(strs => monads_1.Right.unit(firstWordLength(strs)));
    t.deepEqual(m, monads_1.Left.unit(new TypeError("Cannot read property 'length' of undefined")));
});
ava_1.default("Right.map returns Left in case of exception", t => {
    function firstWordLength(words) {
        return words[0].length;
    }
    const m = monads_1.Right.unit([])
        .map(strs => firstWordLength(strs));
    t.deepEqual(m, monads_1.Left.unit(new TypeError("Cannot read property 'length' of undefined")));
});
ava_1.default("Right implements .toString() method", t => {
    t.is("Right(6)", monads_1.Right.unit(6).toString());
    t.is("Right(\"foo\")", monads_1.Right.unit("foo").toString());
    t.is("Right([\"foo\",6])", monads_1.Right.unit(["foo", 6]).toString());
});
ava_1.default("Right obey monad laws", t => {
    const f = (word) => monads_1.Right.unit(word.length);
    const g = (len) => monads_1.Right.unit(len * 2);
    const m = monads_1.Right.unit("foo");
    t.deepEqual(monads_1.Right.unit("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Right.unit), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Left
ava_1.default("Left.unit(a) is new Left(a) shorthand", t => {
    t.deepEqual(monads_1.Left.unit("foo"), new monads_1.Left("foo"));
});
ava_1.default("Left implements .toString() method", t => {
    t.is("Left(Error: foo)", monads_1.Left.unit(new Error("foo")).toString());
});
ava_1.default("Left obey monad laws", t => {
    const f = (word) => monads_1.Left.unit("foo");
    const g = (word) => monads_1.Left.unit(word.length);
    const m = monads_1.Left.unit("foo");
    t.deepEqual(monads_1.Left.unit("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Left.unit), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Either
ava_1.default("Either when it's Right allows for chaining transformations", t => {
    const monad = monads_1.Right.unit("{\"foo\":\"bar\"}")
        .bind(json => {
        try {
            return monads_1.Right.unit(JSON.parse(json));
        }
        catch (err) {
            return monads_1.Left.unit(err);
        }
    })
        .bind(obj => monads_1.Right.unit(obj.foo));
    t.true(monad instanceof monads_1.Right);
    t.is(monad.toString(), "Right(\"bar\")");
});
ava_1.default("Either when it's Left skips chained transformations", t => {
    const monad = monads_1.Right.unit("{\"foo\" \"bar\"}")
        .bind(json => {
        try {
            return monads_1.Right.unit(JSON.parse(json));
        }
        catch (err) {
            return monads_1.Left.unit(err);
        }
    })
        .bind(obj => monads_1.Right.unit(obj.foo));
    t.true(monad instanceof monads_1.Left);
    t.is(monad.toString(), "Left(SyntaxError: Unexpected string in JSON at position 7)");
});
// Continuation
ava_1.default.skip("Continuation.unit(a) is new Continuation(a) shorthand", t => {
    t.deepEqual(monads_1.Continuation.unit("foo"), new monads_1.Continuation("foo"));
});
ava_1.default("Continuation.binds allows for chaining async transformations", t => {
    t.plan(1);
    const spy = sinon.spy();
    return new Promise(resolve => {
        monads_1.Continuation.unit(Promise.resolve({ orders: [{ id: 1 }, { id: 2 }] }))
            .bind(response => response.orders)
            .bind(orders => Promise.resolve(orders[0]))
            .bind(spy)
            .bind(() => {
            t.true(spy.calledWith({ id: 1 }));
            resolve();
        });
    });
});
ava_1.default("Continuation implements .toString() method", t => {
    t.is(monads_1.Continuation.unit(6).toString(), "Continuation([object Promise])");
});
ava_1.default.skip("Continuation obey monad laws", t => {
    const f = (word) => monads_1.Continuation.unit(word.length);
    const g = (len) => monads_1.Continuation.unit(len * 2);
    const m = monads_1.Continuation.unit("foo");
    t.deepEqual(monads_1.Continuation.unit("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Continuation.unit), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// List
ava_1.default("List.unit([a]) is new List([a]) shorthand", t => {
    t.deepEqual(monads_1.List.unit([1, 2, 3]), new monads_1.List([1, 2, 3]));
});
ava_1.default("List.unit is an List.unit alias", t => {
    t.deepEqual(monads_1.List.unit([1, 2, 3]), monads_1.List.unit([1, 2, 3]));
});
ava_1.default("List.bind allows for chaining iterable transformations", t => {
    const actual = monads_1.List.unit([1, 2, 3])
        .bind(iterable => monads_1.List.unit(Array.from(iterable).map(x => x + 1)))
        .bind(iterable => monads_1.List.unit(Array.from(iterable).map(x => x + 1)));
    t.deepEqual(actual, monads_1.List.unit([3, 4, 5]));
});
ava_1.default("List.map allows for chaining items transformations and lazy computation", t => {
    const lazySpy = sinon.spy();
    const nextLazySpy = sinon.spy();
    const m = monads_1.List.unit([1, 2, 3]).map(x => {
        lazySpy();
        return x + 1;
    }).map(x => {
        nextLazySpy();
        return x + 1;
    });
    const underlayingIterable = m[Symbol.iterator]();
    t.true(lazySpy.notCalled);
    t.true(nextLazySpy.notCalled);
    t.is(underlayingIterable.next().value, 3);
    t.true(lazySpy.calledOnce);
    t.true(nextLazySpy.calledOnce);
    t.is(underlayingIterable.next().value, 4);
    t.true(lazySpy.calledTwice);
    t.true(nextLazySpy.calledTwice);
    t.is(underlayingIterable.next().value, 5);
    t.true(lazySpy.calledThrice);
    t.true(nextLazySpy.calledThrice);
});
ava_1.default("List.forEach allows for performing computation and iterate through the result", t => {
    const actual = [];
    const expected = [1, 2, 3];
    monads_1.List.unit([1, 2, 3]).forEach(item => {
        actual.push(item);
    });
    t.deepEqual(actual, expected);
});
ava_1.default("List implements Symbol.iterate", t => {
    const actual = [];
    const expected = [1, 2, 3];
    for (let item of monads_1.List.unit([1, 2, 3])) {
        actual.push(item);
    }
    t.deepEqual(actual, expected);
});
ava_1.default("List implements .toString() method", t => {
    t.is(monads_1.List.unit([1, 2, 3]).toString(), "List([1,2,3])");
});
ava_1.default("List obey monad laws", t => {
    const f = (iterable) => monads_1.List.unit(iterable);
    const g = (iterable) => monads_1.List.unit(Array.from(iterable).map(x => x + 1));
    const m = monads_1.List.unit([1, 2, 3]);
    t.deepEqual(monads_1.List.unit([1, 2, 3]).bind(f), f([1, 2, 3]));
    t.deepEqual(m.bind(monads_1.List.unit), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
//# sourceMappingURL=monads.test.js.map
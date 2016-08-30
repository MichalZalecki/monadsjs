"use strict";
const ava_1 = require("ava");
const sinon = require("sinon");
const monads_1 = require("../lib/monads");
// Identity
ava_1.default("Identity.unit(a) is new Identity(a) shorthand", t => {
    t.deepEqual(monads_1.Identity.unit("foo"), new monads_1.Identity("foo"));
});
ava_1.default("Identity.of is an Identity.unit alias", t => {
    t.deepEqual(monads_1.Identity.of("foo"), monads_1.Identity.unit("foo"));
});
ava_1.default("Identity.bind allows for chaining transformations", t => {
    const actual = monads_1.Identity.of("foo")
        .bind(str => monads_1.Identity.of(str.length))
        .bind(len => monads_1.Identity.of(len * 2));
    t.deepEqual(actual, monads_1.Identity.of(6));
});
ava_1.default("Identity implements .toString() method", t => {
    t.is(monads_1.Identity.of(6).toString(), "Identity(6)");
    t.is(monads_1.Identity.of("foo").toString(), "Identity(\"foo\")");
    t.is(monads_1.Identity.of(["foo", 6]).toString(), "Identity([\"foo\",6])");
});
ava_1.default("Identity obey monad laws", t => {
    const f = (word) => monads_1.Identity.of(word.length);
    const g = (len) => monads_1.Identity.of(len * 2);
    const m = monads_1.Identity.of("foo");
    t.deepEqual(monads_1.Identity.of("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Identity.of), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Just
ava_1.default("Just.unit(a) is new Just(a) shorthand", t => {
    t.deepEqual(monads_1.Just.unit("foo"), new monads_1.Just("foo"));
});
ava_1.default("Just.of is an Just.unit alias", t => {
    t.deepEqual(monads_1.Just.of("foo"), monads_1.Just.unit("foo"));
});
ava_1.default("Just implements .toString() method", t => {
    t.is("Just(6)", monads_1.Just.of(6).toString());
    t.is("Just(\"foo\")", monads_1.Just.of("foo").toString());
    t.is("Just([\"foo\",6])", monads_1.Just.of(["foo", 6]).toString());
});
ava_1.default("Just obey monad laws", t => {
    const f = (word) => monads_1.Just.of(word.length);
    const g = (len) => monads_1.Just.of(len * 2);
    const m = monads_1.Just.of("foo");
    t.deepEqual(monads_1.Just.of("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Just.of), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Nothing
ava_1.default("Nothing.unit() is new Nothing() shorthand", t => {
    t.deepEqual(monads_1.Nothing.unit(), new monads_1.Nothing());
});
ava_1.default("Nothing.of is an Nothing.unit alias", t => {
    t.deepEqual(monads_1.Nothing.of(), monads_1.Nothing.unit());
});
ava_1.default("Nothing implements .toString() method", t => {
    t.is("Nothing()", monads_1.Nothing.of().toString());
});
ava_1.default("Nothing obey monad laws", t => {
    const f = (word) => monads_1.Just.of(word.length);
    const f1 = (word) => new monads_1.Nothing();
    const g = (len) => monads_1.Just.of(len * 2);
    const m = new monads_1.Nothing();
    t.deepEqual(new monads_1.Nothing().bind(f1), f1("foo"));
    t.deepEqual(m.bind(monads_1.Just.of), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Maybe
ava_1.default("Maybe when is Just allows for chaining transformations", t => {
    const doubleFirstWordLength = monads_1.Just.of(["foo", "bar", "foo"])
        .bind(words => words[0] ? monads_1.Just.of(words[0]) : new monads_1.Nothing())
        .bind(word => monads_1.Just.of(word.length))
        .bind(len => monads_1.Just.of(len * 2));
    t.true(doubleFirstWordLength instanceof monads_1.Just);
    t.is(doubleFirstWordLength.toString(), "Just(6)");
});
ava_1.default("Maybe when is Nothing skips chained transformations", t => {
    const doubleFirstWordLength = monads_1.Just.of([])
        .bind(words => words[0] ? monads_1.Just.of(words[0]) : new monads_1.Nothing())
        .bind(word => monads_1.Just.of(word.length))
        .bind(len => monads_1.Just.of(len * 2));
    t.true(doubleFirstWordLength instanceof monads_1.Nothing);
    t.is(doubleFirstWordLength.toString(), "Nothing()");
});
// IO
ava_1.default("IO.unit(IOSideEffect) is new IO(IOSideEffect) shorthand", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    t.deepEqual(monads_1.IO.unit(sideEffect), new monads_1.IO(sideEffect));
});
ava_1.default("IO.of is an IO.unit alias", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    t.deepEqual(monads_1.IO.of(sideEffect), monads_1.IO.unit(sideEffect));
});
ava_1.default("IO.bind allows for chaining side effects", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    const anotherSideEffect = () => { alert("I'm an another side effect!"); };
    const actual = monads_1.IO.of(sideEffect)
        .bind(() => monads_1.IO.of(anotherSideEffect));
    t.deepEqual(actual, monads_1.IO.of(anotherSideEffect));
});
ava_1.default("IO implements .toString() method", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    t.is(monads_1.IO.of(sideEffect).toString(), "IO(IOSideEffect)");
});
ava_1.default("IO can run() side effect", t => {
    const sideEffectSpy = sinon.spy();
    monads_1.IO.of(sideEffectSpy).run();
    t.true(sideEffectSpy.called);
});
ava_1.default("IO obey monad laws", t => {
    const sideEffect = () => { alert("I'm a side effect!"); };
    const anotherSideEffect = () => { alert("I'm an another side effect!"); };
    const yetAnotherSideEffect = () => { alert("I'm a yet another side effect!"); };
    const f = (sf) => monads_1.IO.of(sideEffect);
    const g = (sf) => monads_1.IO.of(anotherSideEffect);
    const m = monads_1.IO.of(yetAnotherSideEffect);
    t.deepEqual(monads_1.IO.of(sideEffect).bind(f), f(sideEffect));
    t.deepEqual(m.bind(monads_1.IO.of), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Right
ava_1.default("Right.unit(a) is new Right(a) shorthand", t => {
    t.deepEqual(monads_1.Right.unit("foo"), new monads_1.Right("foo"));
});
ava_1.default("Right.of is an Right.unit alias", t => {
    t.deepEqual(monads_1.Right.of("foo"), monads_1.Right.unit("foo"));
});
ava_1.default("Right implements .toString() method", t => {
    t.is("Right(6)", monads_1.Right.of(6).toString());
    t.is("Right(\"foo\")", monads_1.Right.of("foo").toString());
    t.is("Right([\"foo\",6])", monads_1.Right.of(["foo", 6]).toString());
});
ava_1.default("Right obey monad laws", t => {
    const f = (word) => monads_1.Right.of(word.length);
    const g = (len) => monads_1.Right.of(len * 2);
    const m = monads_1.Right.of("foo");
    t.deepEqual(monads_1.Right.of("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Right.of), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Left
ava_1.default("Left.unit(a) is new Left(a) shorthand", t => {
    t.deepEqual(monads_1.Left.unit("foo"), new monads_1.Left("foo"));
});
ava_1.default("Left.of is an Left.unit alias", t => {
    t.deepEqual(monads_1.Left.of("foo"), monads_1.Left.unit("foo"));
});
ava_1.default("Left implements .toString() method", t => {
    t.is("Left(Error: foo)", monads_1.Left.of(new Error("foo")).toString());
});
ava_1.default("Left obey monad laws", t => {
    const f = (word) => monads_1.Left.of("foo");
    const g = (word) => monads_1.Left.of(word.length);
    const m = monads_1.Left.of("foo");
    t.deepEqual(monads_1.Left.of("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Left.of), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// Either
ava_1.default("Either when it's Right allows for chaining transformations", t => {
    const monad = monads_1.Right.of("{\"foo\":\"bar\"}")
        .bind(json => {
        try {
            return monads_1.Right.of(JSON.parse(json));
        }
        catch (err) {
            return monads_1.Left.of(err);
        }
    })
        .bind(obj => monads_1.Right.of(obj.foo));
    t.true(monad instanceof monads_1.Right);
    t.is(monad.toString(), "Right(\"bar\")");
});
ava_1.default("Either when it's Left skips chained transformations", t => {
    const monad = monads_1.Right.of("{\"foo\" \"bar\"}")
        .bind(json => {
        try {
            return monads_1.Right.of(JSON.parse(json));
        }
        catch (err) {
            return monads_1.Left.of(err);
        }
    })
        .bind(obj => monads_1.Right.of(obj.foo));
    t.true(monad instanceof monads_1.Left);
    t.is(monad.toString(), "Left(SyntaxError: Unexpected string in JSON at position 7)");
});
// Continuation
ava_1.default("Continuation.unit(a) is new Left(a) shorthand", t => {
    t.deepEqual(monads_1.Continuation.unit("foo"), new monads_1.Continuation("foo"));
});
ava_1.default("Continuation.of is an Continuation.unit alias", t => {
    t.deepEqual(monads_1.Continuation.of("foo"), monads_1.Continuation.unit("foo"));
});
ava_1.default("Continuation.binds allows for chaining async transformations", t => {
    t.plan(1);
    const spy = sinon.spy();
    return new Promise(resolve => {
        monads_1.Continuation.of(Promise.resolve({ orders: [{ id: 1 }, { id: 2 }] }))
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
    t.is(monads_1.Continuation.of(6).toString(), "Continuation([object Promise])");
});
ava_1.default("Continuation obey monad laws", t => {
    const f = (word) => monads_1.Continuation.of(word.length);
    const g = (len) => monads_1.Continuation.of(len * 2);
    const m = monads_1.Continuation.of("foo");
    t.deepEqual(monads_1.Continuation.of("foo").bind(f), f("foo"));
    t.deepEqual(m.bind(monads_1.Continuation.of), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
// List
ava_1.default("List.unit([a]) is new List([a]) shorthand", t => {
    t.deepEqual(monads_1.List.unit([1, 2, 3]), new monads_1.List([1, 2, 3]));
});
ava_1.default("List.of is an List.unit alias", t => {
    t.deepEqual(monads_1.List.of([1, 2, 3]), monads_1.List.unit([1, 2, 3]));
});
ava_1.default("List.bind allows for chaining iterable transformations", t => {
    const actual = monads_1.List.of([1, 2, 3])
        .bind(iterable => monads_1.List.of(Array.from(iterable).map(x => x + 1)))
        .bind(iterable => monads_1.List.of(Array.from(iterable).map(x => x + 1)));
    t.deepEqual(actual, monads_1.List.of([3, 4, 5]));
});
ava_1.default("List.map allows for chaining items transformations and lazy computation", t => {
    const lazySpy = sinon.spy();
    const nextLazySpy = sinon.spy();
    const m = monads_1.List.of([1, 2, 3]).map(x => {
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
ava_1.default("List implements .toString() method", t => {
    t.is(monads_1.List.of([1, 2, 3]).toString(), "List([1,2,3])");
});
ava_1.default("List obey monad laws", t => {
    const f = (iterable) => monads_1.List.of(iterable);
    const g = (iterable) => monads_1.List.of(Array.from(iterable).map(x => x + 1));
    const m = monads_1.Just.of([1, 2, 3]);
    t.deepEqual(monads_1.List.of([1, 2, 3]).bind(f), f([1, 2, 3]));
    t.deepEqual(m.bind(monads_1.Just.of), m);
    t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});
//# sourceMappingURL=monads.test.js.map
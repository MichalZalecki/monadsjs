import test from "ava";
import * as sinon from "sinon";
import {
  Identity,
  Maybe,
  Just,
  Nothing,
  IO,
  IOSideEffect,
  Either,
  Right,
  Left,
  Continuation,
  List,
} from "../lib/monads";

// Identity

test("Identity.unit(a) is new Identity(a) shorthand", t => {
  t.deepEqual(Identity.unit("foo"), new Identity("foo"));
});

test("Identity.unit is an Identity.unit alias", t => {
  t.deepEqual(Identity.unit("foo"), Identity.unit("foo"));
});

test("Identity.bind allows for chaining transformations", t => {
  const actual = Identity.unit("foo")
    .bind(str => Identity.unit(str.length))
    .bind(len => Identity.unit(len * 2));

  t.deepEqual(actual, Identity.unit(6));
});

test("Identity.map allows for chaining underlaying value transformations", t => {
  const actual = Identity.unit("foo")
    .map(str => str.length)
    .map(len => len * 2);

  t.deepEqual(actual, Identity.unit(6));
});

test("Identity implements Comonad", t => {
  t.is(Identity.unit("Comonad").extract(), "Comonad");
});

test("Identity implements .toString() method", t => {
  t.is(Identity.unit(6).toString(), "Identity(6)");
  t.is(Identity.unit("foo").toString(), "Identity(\"foo\")");
  t.is(Identity.unit(["foo", 6]).toString(), "Identity([\"foo\",6])");
});

test("Identity obey monad laws", t => {
  const f = (word: string) => Identity.unit(word.length);
  const g = (len: number) => Identity.unit(len * 2);
  const m = Identity.unit("foo");

  t.deepEqual(Identity.unit("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Identity.unit), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Just

test("Just.unit(a) is new Just(a) shorthand", t => {
  t.deepEqual(Just.unit("foo"), new Just("foo"));
});

test("Just.bind returns Nothing in case of exception", t => {
  function firstWordLength(words: string[]) {
    return words[0].length;
  }

  const m: Maybe<number> = Just.unit([])
    .bind(strs => Just.unit(firstWordLength(strs)));

  t.deepEqual(m, new Nothing());
});

test("Just.map returns Nothing in case of exception", t => {
  function firstWordLength(words: string[]) {
    return words[0].length;
  }

  const m: Maybe<number> = Just.unit([])
    .map(strs => firstWordLength(strs));

  t.deepEqual(m, new Nothing());
});

test("Just implements .toString() method", t => {
  t.is("Just(6)", Just.unit(6).toString());
  t.is("Just(\"foo\")", Just.unit("foo").toString());
  t.is("Just([\"foo\",6])", Just.unit(["foo", 6]).toString());
});

test("Just obey monad laws", t => {
  const f = (word: string) => Just.unit(word.length);
  const g = (len: number) => Just.unit(len * 2);
  const m = Just.unit("foo");

  t.deepEqual(Just.unit("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Just.unit), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Nothing

test("Nothing.unit() is new Nothing() shorthand", t => {
  t.deepEqual(Nothing.unit(), new Nothing());
});

test("Nothing.unit is an Nothing.unit alias", t => {
  t.deepEqual(Nothing.unit(), Nothing.unit());
});

test("Nothing implements .toString() method", t => {
  t.is("Nothing()", Nothing.unit().toString());
});

test("Nothing obey monad laws", t => {
  const f = (word: string) => Just.unit(word.length);
  const f1 = (word: string) => Nothing.unit();
  const g = (len: number) => Just.unit(len * 2);
  const m = Nothing.unit<string>();

  t.deepEqual(Nothing.unit().bind(f1), f1("foo"));
  t.deepEqual(m.bind(Just.unit), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Maybe

test("Maybe when is Just allows for chaining transformations", t => {
  const doubleFirstWordLength: Maybe<number> = Just.unit(["foo", "bar", "foo"])
    .bind<string>(words => words[0] ? Just.unit(words[0]) : new Nothing())
    .bind<number>(word => Just.unit(word.length))
    .bind<number>(len => Just.unit(len * 2));

  t.true(doubleFirstWordLength instanceof Just);
  t.is(doubleFirstWordLength.toString(), "Just(6)");
});

test("Maybe when is Nothing skips chained transformations", t => {
  const doubleFirstWordLength: Maybe<number> = Just.unit([])
    .bind<string>(words => words[0] ? Just.unit(words[0]) : new Nothing())
    .bind<number>(word => Just.unit(word.length))
    .bind<number>(len => Just.unit(len * 2));

  t.true(doubleFirstWordLength instanceof Nothing);
  t.is(doubleFirstWordLength.toString(), "Nothing()");
});

// IO

test("IO.unit(IOSideEffect) is new IO(IOSideEffect) shorthand", t => {
  const sideEffect = () => { alert("I'm a side effect!"); };
  t.deepEqual(IO.unit(sideEffect), new IO(sideEffect));
});

test("IO.unit is an IO.unit alias", t => {
  const sideEffect = () => { alert("I'm a side effect!"); };
  t.deepEqual(IO.unit(sideEffect), IO.unit(sideEffect));
});

test("IO.bind allows for chaining side effects", t => {
  const sideEffect = () => { alert("I'm a side effect!"); };
  const anotherSideEffect = () => { alert("I'm an another side effect!"); };

  const actual = IO.unit(sideEffect)
    .bind(() => IO.unit(anotherSideEffect));

  t.deepEqual(actual, IO.unit(anotherSideEffect));
});

test("IO implements .toString() method", t => {
  const sideEffect: IOSideEffect = name => { alert(`Hello ${name}! I'm a side effect!`); };

  t.is(IO.unit(sideEffect, "World").toString(), "IO(sideEffect, [\"World\"])");
});

test("IO.equals check IO monads deep quality", t => {
  const sideEffect = () => { alert("I'm a side effect!"); };
  const anotherSideEffect = () => { alert("I'm a another side effect!"); };
  const m1 = IO.unit(sideEffect, 1, 2, 3);

  t.true(m1.equals(IO.unit(sideEffect, 1, 2, 3)));
  t.false(m1.equals(IO.unit(sideEffect, 1, 2)));
  t.false(m1.equals(IO.unit(anotherSideEffect, 1, 2, 3)));
});

test("IO can run() side effect", t => {
  const sideEffectSpy = sinon.spy();

  IO.unit(sideEffectSpy, 101).run();
  t.true(sideEffectSpy.calledWith(101));
});

test("IO obey monad laws", t => {
  const sideEffect = () => { alert("I'm a side effect!"); };
  const anotherSideEffect = () => { alert("I'm an another side effect!"); };
  const yetAnotherSideEffect = () => { alert("I'm a yet another side effect!"); };

  const f = (sf: IOSideEffect) => IO.unit(sideEffect);
  const g = (sf: IOSideEffect) => IO.unit(anotherSideEffect);
  const m = IO.unit(yetAnotherSideEffect);

  t.deepEqual(IO.unit(sideEffect).bind(f), f(sideEffect));
  t.deepEqual(m.bind(IO.unit), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Right

test("Right.unit(a) is new Right(a) shorthand", t => {
  t.deepEqual(Right.unit("foo"), new Right("foo"));
});

test("Right.unit is an Right.unit alias", t => {
  t.deepEqual(Right.unit("foo"), Right.unit("foo"));
});

test("Right.bind returns Left in case of exception", t => {
  function firstWordLength(words: string[]) {
    return words[0].length;
  }

  const m: Either<number | TypeError> = Right.unit([])
    .bind(strs => Right.unit(firstWordLength(strs)));

  t.deepEqual(m, Left.unit(new TypeError("Cannot read property 'length' of undefined")));
});

test("Right.map returns Left in case of exception", t => {
  function firstWordLength(words: string[]) {
    return words[0].length;
  }

  const m: Either<number | TypeError> = Right.unit([])
    .map(strs => firstWordLength(strs));

  t.deepEqual(m, Left.unit(new TypeError("Cannot read property 'length' of undefined")));
});

test("Right implements .toString() method", t => {
  t.is("Right(6)", Right.unit(6).toString());
  t.is("Right(\"foo\")", Right.unit("foo").toString());
  t.is("Right([\"foo\",6])", Right.unit(["foo", 6]).toString());
});

test("Right obey monad laws", t => {
  const f = (word: string) => Right.unit(word.length);
  const g = (len: number) => Right.unit(len * 2);
  const m = Right.unit<string>("foo");

  t.deepEqual(Right.unit("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Right.unit), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Left

test("Left.unit(a) is new Left(a) shorthand", t => {
  t.deepEqual(Left.unit("foo"), new Left("foo"));
});

test("Left implements .toString() method", t => {
  t.is("Left(Error: foo)", Left.unit(new Error("foo")).toString());
});

test("Left obey monad laws", t => {
  const f = (word: string) => Left.unit("foo");
  const g = (word: string) => Left.unit(word.length);
  const m = Left.unit("foo");

  t.deepEqual(Left.unit("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Left.unit), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Either

test("Either when it's Right allows for chaining transformations", t => {
  const monad: Either<string> = Right.unit("{\"foo\":\"bar\"}")
    .bind(json => {
      try {
        return Right.unit(JSON.parse(json));
      } catch (err) {
        return Left.unit(err);
      }
    })
    .bind(obj => Right.unit(obj.foo));

  t.true(monad instanceof Right);
  t.is(monad.toString(), "Right(\"bar\")");
});

test("Either when it's Left skips chained transformations", t => {
  const monad: Either<string> = Right.unit("{\"foo\" \"bar\"}")
    .bind(json => {
      try {
        return Right.unit(JSON.parse(json));
      } catch (err) {
        return Left.unit(err);
      }
    })
    .bind(obj => Right.unit(obj.foo));

  t.true(monad instanceof Left);
  t.is(monad.toString(), "Left(SyntaxError: Unexpected string in JSON at position 7)");
});

// Continuation

test.skip("Continuation.unit(a) is new Continuation(a) shorthand", t => {
  t.deepEqual(Continuation.unit("foo"), new Continuation("foo"));
});

test("Continuation.binds allows for chaining async transformations", t => {
  t.plan(1);

  const spy = sinon.spy();

  return new Promise<void>(resolve => {
    Continuation.unit(Promise.resolve({ orders: [{id: 1}, {id: 2}] }))
    .bind(response => response.orders)
    .bind(orders => Promise.resolve(orders[0]))
    .bind(spy)
    .bind(() => {
      t.true(spy.calledWith({id: 1}));
      resolve();
    });
  });
});

test("Continuation implements .toString() method", t => {
  t.is(Continuation.unit(6).toString(), "Continuation([object Promise])");
});

test.skip("Continuation obey monad laws", t => {
  const f = (word: string) => Continuation.unit(word.length);
  const g = (len: number) => Continuation.unit(len * 2);
  const m = Continuation.unit("foo");

  t.deepEqual(Continuation.unit("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Continuation.unit), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// List

test("List.unit([a]) is new List([a]) shorthand", t => {
  t.deepEqual(List.unit([1, 2, 3]), new List([1, 2, 3]));
});

test("List.unit is an List.unit alias", t => {
  t.deepEqual(List.unit([1, 2, 3]), List.unit([1, 2, 3]));
});

test("List.bind allows for chaining iterable transformations", t => {
  const actual = List.unit([1, 2, 3])
    .bind(iterable => List.unit(Array.from(iterable).map(x => x + 1)))
    .bind(iterable => List.unit(Array.from(iterable).map(x => x + 1)));

  t.deepEqual(actual, List.unit([3, 4, 5]));
});

test("List.map allows for chaining items transformations and lazy computation", t => {
  const lazySpy = sinon.spy();
  const nextLazySpy = sinon.spy();

  const m = List.unit([1, 2, 3]).map(x => {
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

test("List.forEach allows for performing computation and iterate through the result", t => {
  const actual: number[] = [];
  const expected = [1, 2, 3];
  List.unit([1, 2, 3]).forEach(item => {
    actual.push(item);
  });

  t.deepEqual(actual, expected);
});

test("List implements Symbol.iterate", t => {
  const actual: number[] = [];
  const expected = [1, 2, 3];
  for (let item of List.unit([1, 2, 3])) {
    actual.push(item);
  }
  t.deepEqual(actual, expected);
});

test("List implements .toString() method", t => {
  t.is(List.unit([1, 2, 3]).toString(), "List([1,2,3])");
});

test("List obey monad laws", t => {
  const f = (iterable: Iterable<number>) => List.unit(iterable);
  const g = (iterable: Iterable<number>) => List.unit(Array.from(iterable).map(x => x + 1));
  const m = List.unit([1, 2, 3]);

  t.deepEqual(List.unit([1, 2, 3]).bind(f), f([1, 2, 3]));
  t.deepEqual(m.bind(List.unit), m);
  t.deepEqual(
    m.bind(f).bind(g),
    m.bind(x => f(x).bind(g))
  );
});

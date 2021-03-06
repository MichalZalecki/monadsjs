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

test("Identity.of is an Identity.unit alias", t => {
  t.deepEqual(Identity.of("foo"), Identity.unit("foo"));
});

test("Identity.bind allows for chaining transformations", t => {
  const actual = Identity.of("foo")
    .bind(str => Identity.of(str.length))
    .bind(len => Identity.of(len * 2));

  t.deepEqual(actual, Identity.of(6));
});

test("Identity.map allows for chaining underlaying value transformations", t => {
  const actual = Identity.of("foo")
    .map(str => str.length)
    .map(len => len * 2);

  t.deepEqual(actual, Identity.of(6));
});

test("Identity implements Comonad", t => {
  t.is(Identity.of("Comonad").extract(), "Comonad");
});

test("Identity implements .toString() method", t => {
  t.is(Identity.of(6).toString(), "Identity(6)");
  t.is(Identity.of("foo").toString(), "Identity(\"foo\")");
  t.is(Identity.of(["foo", 6]).toString(), "Identity([\"foo\",6])");
});

test("Identity obey monad laws", t => {
  const f = (word: string) => Identity.of(word.length);
  const g = (len: number) => Identity.of(len * 2);
  const m = Identity.of("foo");

  t.deepEqual(Identity.of("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Identity.of), m);
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
  t.is("Just(6)", Just.of(6).toString());
  t.is("Just(\"foo\")", Just.of("foo").toString());
  t.is("Just([\"foo\",6])", Just.of(["foo", 6]).toString());
});

test("Just obey monad laws", t => {
  const f = (word: string) => Just.of(word.length);
  const g = (len: number) => Just.of(len * 2);
  const m = Just.of("foo");

  t.deepEqual(Just.of("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Just.of), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Nothing

test("Nothing.unit() is new Nothing() shorthand", t => {
  t.deepEqual(Nothing.unit(), new Nothing());
});

test("Nothing.of is an Nothing.unit alias", t => {
  t.deepEqual(Nothing.of(), Nothing.unit());
});

test("Nothing implements .toString() method", t => {
  t.is("Nothing()", Nothing.of().toString());
});

test("Nothing obey monad laws", t => {
  const f = (word: string) => Just.of(word.length);
  const f1 = (word: string) => Nothing.unit();
  const g = (len: number) => Just.of(len * 2);
  const m = Nothing.unit();

  t.deepEqual(Nothing.unit().bind(f1), f1("foo"));
  t.deepEqual(m.bind(Just.of), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Maybe

test("Maybe when is Just allows for chaining transformations", t => {
  const doubleFirstWordLength: Maybe<number> = Just.of(["foo", "bar", "foo"])
    .bind<string>(words => words[0] ? Just.of(words[0]) : new Nothing())
    .bind<number>(word => Just.of(word.length))
    .bind<number>(len => Just.of(len * 2));

  t.true(doubleFirstWordLength instanceof Just);
  t.is(doubleFirstWordLength.toString(), "Just(6)");
});

test("Maybe when is Nothing skips chained transformations", t => {
  const doubleFirstWordLength: Maybe<number> = Just.of([])
    .bind<string>(words => words[0] ? Just.of(words[0]) : new Nothing())
    .bind<number>(word => Just.of(word.length))
    .bind<number>(len => Just.of(len * 2));

  t.true(doubleFirstWordLength instanceof Nothing);
  t.is(doubleFirstWordLength.toString(), "Nothing()");
});

// IO

test("IO.unit(IOSideEffect) is new IO(IOSideEffect) shorthand", t => {
  const sideEffect = () => { alert("I'm a side effect!"); };
  t.deepEqual(IO.unit(sideEffect), new IO(sideEffect));
});

test("IO.of is an IO.unit alias", t => {
  const sideEffect = () => { alert("I'm a side effect!"); };
  t.deepEqual(IO.of(sideEffect), IO.unit(sideEffect));
});

test("IO.bind allows for chaining side effects", t => {
  const sideEffect = () => { alert("I'm a side effect!"); };
  const anotherSideEffect = () => { alert("I'm an another side effect!"); };

  const actual = IO.of(sideEffect)
    .bind(() => IO.of(anotherSideEffect));

  t.deepEqual(actual, IO.of(anotherSideEffect));
});

test("IO implements .toString() method", t => {
  const sideEffect: IOSideEffect = name => { alert(`Hello ${name}! I'm a side effect!`); };

  t.is(IO.of(sideEffect, "World").toString(), "IO(sideEffect, [\"World\"])");
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

  IO.of(sideEffectSpy, 101).run();
  t.true(sideEffectSpy.calledWith(101));
});

test("IO obey monad laws", t => {
  const sideEffect = () => { alert("I'm a side effect!"); };
  const anotherSideEffect = () => { alert("I'm an another side effect!"); };
  const yetAnotherSideEffect = () => { alert("I'm a yet another side effect!"); };

  const f = (sf: IOSideEffect) => IO.of(sideEffect);
  const g = (sf: IOSideEffect) => IO.of(anotherSideEffect);
  const m = IO.of(yetAnotherSideEffect);

  t.deepEqual(IO.of(sideEffect).bind(f), f(sideEffect));
  t.deepEqual(m.bind(IO.of), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Right

test("Right.unit(a) is new Right(a) shorthand", t => {
  t.deepEqual(Right.unit("foo"), new Right("foo"));
});

test("Right.of is an Right.unit alias", t => {
  t.deepEqual(Right.of("foo"), Right.unit("foo"));
});

test("Right.bind returns Left in case of exception", t => {
  function firstWordLength(words: string[]) {
    return words[0].length;
  }

  const m: Either<number | TypeError> = Right.unit([])
    .bind(strs => Right.of(firstWordLength(strs)));

  t.deepEqual(m, Left.unit(new TypeError()));
});

test("Right.map returns Left in case of exception", t => {
  function firstWordLength(words: string[]) {
    return words[0].length;
  }

  const m: Either<number | TypeError> = Right.unit([])
    .map(strs => firstWordLength(strs));

  t.deepEqual(m, Left.unit(new TypeError()));
});

test("Right implements .toString() method", t => {
  t.is("Right(6)", Right.of(6).toString());
  t.is("Right(\"foo\")", Right.of("foo").toString());
  t.is("Right([\"foo\",6])", Right.of(["foo", 6]).toString());
});

test("Right obey monad laws", t => {
  const f = (word: string) => Right.of(word.length);
  const g = (len: number) => Right.of(len * 2);
  const m = Right.of("foo");

  t.deepEqual(Right.of("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Right.of), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Left

test("Left.unit(a) is new Left(a) shorthand", t => {
  t.deepEqual(Left.unit("foo"), new Left("foo"));
});

test("Left.of is an Left.unit alias", t => {
  t.deepEqual(Left.of("foo"), Left.unit("foo"));
});

test("Left implements .toString() method", t => {
  t.is("Left(Error: foo)", Left.of(new Error("foo")).toString());
});

test("Left obey monad laws", t => {
  const f = (word: string) => Left.of("foo");
  const g = (word: string) => Left.of(word.length);
  const m = Left.of("foo");

  t.deepEqual(Left.of("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Left.of), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// Either

test("Either when it's Right allows for chaining transformations", t => {
  const monad: Either<string> = Right.of("{\"foo\":\"bar\"}")
    .bind(json => {
      try {
        return Right.of(JSON.parse(json));
      } catch (err) {
        return Left.of(err);
      }
    })
    .bind(obj => Right.of(obj.foo));

  t.true(monad instanceof Right);
  t.is(monad.toString(), "Right(\"bar\")");
});

test("Either when it's Left skips chained transformations", t => {
  const monad: Either<string> = Right.of("{\"foo\" \"bar\"}")
    .bind(json => {
      try {
        return Right.of(JSON.parse(json));
      } catch (err) {
        return Left.of(err);
      }
    })
    .bind(obj => Right.of(obj.foo));

  t.true(monad instanceof Left);
  t.is(monad.toString(), "Left(SyntaxError: Unexpected string in JSON at position 7)");
});

// Continuation

test("Continuation.unit(a) is new Continuation(a) shorthand", t => {
  t.deepEqual(Continuation.unit("foo"), new Continuation("foo"));
});

test("Continuation.of is an Continuation.unit alias", t => {
  t.deepEqual(Continuation.of("foo"), Continuation.unit("foo"));
});

test("Continuation.binds allows for chaining async transformations", t => {
  t.plan(1);

  const spy = sinon.spy();

  return new Promise<void>(resolve => {
    Continuation.of(Promise.resolve({ orders: [{id: 1}, {id: 2}] }))
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
  t.is(Continuation.of(6).toString(), "Continuation([object Promise])");
});

test("Continuation obey monad laws", t => {
  const f = (word: string) => Continuation.of(word.length);
  const g = (len: number) => Continuation.of(len * 2);
  const m = Continuation.of("foo");

  t.deepEqual(Continuation.of("foo").bind(f), f("foo"));
  t.deepEqual(m.bind(Continuation.of), m);
  t.deepEqual(m.bind(f).bind(g), m.bind(x => f(x).bind(g)));
});

// List

test("List.unit([a]) is new List([a]) shorthand", t => {
  t.deepEqual(List.unit([1, 2, 3]), new List([1, 2, 3]));
});

test("List.of is an List.unit alias", t => {
  t.deepEqual(List.of([1, 2, 3]), List.unit([1, 2, 3]));
});

test("List.bind allows for chaining iterable transformations", t => {
  const actual = List.of([1, 2, 3])
    .bind(iterable => List.of(Array.from(iterable).map(x => x + 1)))
    .bind(iterable => List.of(Array.from(iterable).map(x => x + 1)));

  t.deepEqual(actual, List.of([3, 4, 5]));
});

test("List.map allows for chaining items transformations and lazy computation", t => {
  const lazySpy = sinon.spy();
  const nextLazySpy = sinon.spy();

  const m = List.of([1, 2, 3]).map(x => {
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
  t.is(List.of([1, 2, 3]).toString(), "List([1,2,3])");
});

test("List obey monad laws", t => {
  const f = (iterable: Iterable<number>) => List.of(iterable);
  const g = (iterable: Iterable<number>) => List.of(Array.from(iterable).map(x => x + 1));
  const m = List.of([1, 2, 3]);

  t.deepEqual(List.of([1, 2, 3]).bind(f), f([1, 2, 3]));
  t.deepEqual(m.bind(List.of), m);
  t.deepEqual(
    m.bind(f).bind(g),
    m.bind(x => f(x).bind(g))
  );
});

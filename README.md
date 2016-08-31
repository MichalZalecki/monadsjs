# monadsjs

[![Build Status](https://travis-ci.org/MichalZalecki/monadsjs.svg?branch=master)](https://travis-ci.org/MichalZalecki/monadsjs)

## Installation

```
npm install --save monadsjs
```

## Monads

Don't forget to check [tests](src/test/monads.test.ts).

### Identity

It's the most basic monad implementation which only wraps a value. It doesn't make much sense to
use this monad as is. Understanding Identity monad is quite crucial to move forward. It can be a
starting point for any new monad.

```js
// Identity.unit :: a -> M a
// Identity.bind :: (a -> M b) -> M b
// Identity.map  :: (a -> b) -> M b

Identity.unit("Monads are awesome!")
  .bind(str => Identity.unit(str.split(" ")))
  .map(words => words.length);

// Identity(3)
```

### Maybe (Just | Nothing)

Maybe monad represents a value (`Just`) or monadic zero (`Nothing`). It's very convinient way to just
literally let your code fail. Instead of writing multiple checks and try-catches just check type of
the value at the end of transformations chain. In this particular implementation Maybe is just a
union type which exists only if you are using TypeScript.

Just wraps actual value.

```js
// Just.unit :: a -> Just a
// Just.bind :: (a -> Just b | Nothing) -> Just b | Nothing
// Just.map  :: (a -> b) -> Just b | Nothing

Just.unit("Monads are awesome!")
  .bind(str => Just.unit(str.split(" ")))
  .map((words: string[]) => words.length);

  // Just(3)
```

At that point it's really similar to Identity monad. Things looks different when Nothing comes in.
Nothing can be explicity returned from function passed to bind or when error occures. Further
execution is stopped. In the following example `double` is not going to be called due to `TypeError`
throwed in `firstWordLength` when empty array is passed.

```js
// Nothing.unit :: () -> Nothing
// Nothing.bind :: (a -> Just b | Nothing) -> | Nothing
// Nothing.map  :: (a -> b) -> | Nothing

const firstWordLength = words => words[0].length;
const double = n => n * 2;

Just.unit([])
  .bind(strs => Just.unit(firstWordLength(strs)));
  .map(double);

  // Nothing()
```

### Either (Left | Right)

Either monad is almost like a Maybe monad. `Right` and `Just` are basically the same. Either unlike
Maybe doesn't have monadic zero. `Left` is supposed to wrap `Error`. `Left` can be explicity
returned from function passed to bind or when error occures. In this particular implementation
Either is just a union type which exists only if you are using TypeScript. In the following
example `double` is not going to be called due to `TypeError` throwed in `firstWordLength`
when empty array is passed.

```js
// Right.unit :: a -> Right a
// Right.bind :: (a -> Right b | Left b) -> Right b | Left b
// Right.map  :: (a -> b) -> Right b | Left b

Right.unit("Monads are awesome!")
  .bind(str => Right.unit(str.split(" ")))
  .map((words: string[]) => words.length);

  // Right(3)
```

```js
// Left.unit :: a -> Left a
// Left.bind :: (a -> Right b | Left b) -> Left a
// Left.map  :: (a -> b) -> Left a

const firstWordLength = words => words[0].length;
const double = n => n * 2;

Right.unit([])
  .bind(strs => Right.unit(firstWordLength(strs)))
  .map(double);

  // Left(TypeError: Cannot read property 'length' of undefined)
```

### IO

IO monad was invented to make it possible to perform side effects in pure functional languages
(here I have Haskell in mind). In JavaScript we can take an advantage of IO monads to change unpure
functions into pure which makes them easy to test. `IO.equals` makes it easy to deep compare two IO
monads.

```js
// IO.unit :: (a, ...) -> IO a, [...]
// IO.bind :: ((a, ...) -> IO) -> IO a, [...]
// IO.run  :: () -> void

function sayHello(name) {
  return IO.unit(alert, `Hello ${name}!`);
}

const m = sayHello("World"); // IO(sayHello, ["World"])

assert(m.equals(IO.unit(alert, "Hello World!"))); // passes

m.run(); // alerts: Hello World!
```

### Continuation (Promise)

Promise out of the box is a grate Continuation monad implementation! `Promise.resolve` corresponds
to `unit` and `Promise.then` corresponds to `bind`. Provided Continuation implementation is a minimal
wrapper for Promise with methods you know from other monads (`bind` and `unit`). Don't use it, use
Promise.

```js
// Continuation.unit :: a -> Continuation a
// Continuation.bind :: (a -> b) -> Continuation b

Continuation.unit(fetch("https://api.github.com/users/octocat"))
  .bind(response => response.json());

  // Continuation(<Promise>{ "login": "octocat", "id": ... })
```

### List

List monad is a clever one. List constructor accepts `Iterable` and allows for lazy transformations.
It is achieved using generators. What is more, List implements `Symbol.iterator` so you can iterate
through it like any regular iterator.

```js
// List.unit    :: a -> List a
// List.bind    :: (a -> List b) -> List b
// List.map     :: (a -> b) -> List b
// List.forEach :: (a -> void) -> void

const lazySpy = sinon.spy();
const nextLazySpy = sinon.spy();

const m = List.of([1, 2, 3])
  .map(x => {
    lazySpy();
    return x + 1;
  }).map(x => {
    nextLazySpy();
    return x + 1;
  });

  // List([object Generator])

const asIterable = m[Symbol.iterator]();

// no computation was done so far

assert(lazySpy.notCalled);
assert(nextLazySpy.notCalled);

assert(asIterable.next().value === 3);

// only first value was computed

assert(lazySpy.calledOnce);
assert(nextLazySpy.calledOnce);

assert(asIterable.next().value === 4);
assert(lazySpy.calledTwice);
assert(nextLazySpy.calledTwice);

assert(asIterable.next().value === 5);
assert(lazySpy.calledThrice);
assert(nextLazySpy.calledThrice);
```

## Monads next

*Monad next* is a bit different approach to implementing monads in JavaScript. It requires `::` bind
operator wich is not yet supported in TypeScript (shame on you TypeScript, ave Babel!) and having
types when implemening monads is more important for me at this very moment.

```js
const List = {
  *unit(iterable) {
    yield* iterable;
  },

  *bind(fn) {
    for (let x of this) {
      yield fn(x);
    }
  }
};

const m = List.unit([1, 2, 3])::List.bind(x => x + 1)::List.bind(x => x + 1);
```

[Check it live](https://jsfiddle.net/d0r43hnL/2/).

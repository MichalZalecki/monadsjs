# monadsjs

[![Build Status](https://travis-ci.org/MichalZalecki/monadsjs.svg?branch=master)](https://travis-ci.org/MichalZalecki/monadsjs)

Examples are on their way. For now, check [tests](src/test/monads.test.ts).

## Installation

```
npm install --save monadsjs
```

## Monads

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
union type which will exists only if you are using TypeScript.

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

### IO

### Promise

### List

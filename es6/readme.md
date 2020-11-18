## Data Types

In Javascript we have seven primitives types, Everything else, including functions and arrays, is an object.

- Null: `null`
- Undefined: `undefined`
- Number: `1,1.5,-1e4, NaN`
- BigInt: `1n, 9007199254740993n`
- String: `'str', "str"`
- Boolean: `true, false`
- Symbol: `Symbol('description'), Symbol.for('namespace')`

The `null` primitive is typically used to describe the absence of an object, whereas `undefined` is the absence of a defined value. Any variable initialized without a value will be `undefined`. Any expression that attempts access of a non-existent property on object will result in `undefined`. A function without a `return` statement will return `undefined`.

The Number type is double-precision floating-point format. It allows both integers and decimals but has an integer range of `-253-1` to `253-1`. The BigInt type has no upper/lower limit on integers.

Strings can be created with single or double quotes, or backticks. Strings created with backticks are template strings, these can be multiline and support interpolation whereas normal strings can only be concatenated together using the plus (+) operator.

`Symbols` can be used as unique identifier keys in objects. The `Symbol.for` method creates/gets a global symbol.

Other than that, absolutely everything else in JavaScript is an object. An object is a set of key value pairs, where values can be any primitive type or an object (including functions, since functions are objects). Object keys are called properties. An object with a key holding a value that is another object allows for nested data structures:

```sh
const obj = { myKey: { thisIs: 'a nested object' } }
console.log(obj.myKey)
```

All JavaScript objects have prototypes. A prototype is an implicit reference to another object that is queried in property lookups. If an object doesn't have a particular property, the object's prototype is checked for that property. If the object's prototype does not have that property, the object's prototype's prototype is checked and so on. This is how inheritance in JavaScript works, JavaScript is a prototypal language.

## Functions
Functions are first class citizens in JavaScript. A Function is an object and therefore a value and can be used like any other value.
> First-class citizenship simply means “being able to do what everyone else can do.

For example a function can be returned from another function:
```sh
function myFunction () {
    return anotherFunction() {}
}
```

A function can be passed to another function as an argument:
```sh
function myFunction () {

}
setTimeout(myFunction, 1000)
```

A function can be assigned to an object:
```sh
const myObj = {
    id: 215,
    myFunction: function () {
        console.log(this.id)
    }
}
myObj.myFunction() // prints 215
```

When a function is assigned to an object, when the implicit this keyword is accessed within that function it will refer to the object on which the function was called. This is why `myObbj.myFunction()` outputs `215`

It's crucial to understand that this refers to the object on which the function was called, not the object which the function was assigned to:

```sh
const obj = { id: 215, myFunction: function () { console.log(this.id) } }
const obj2 = { id: 92, myFunction: obj.myFunction }
obj.myFunction() // prints 215
obj2.myFunction() // prints 92
```

Both `obj` and `obj2` to reference the same function but on each invocation the this context changes to the object on which that function was called.

Functions have a `call` method that can be used to set their this context:

```sh
function fn() {
    console.log(this.id)
}

const obj = { id: 215 }
const obj2 = { id: 92 }

fn.call(obj) // prints 215
fn.call(obj2) // prints 92
fn.call({ id: ':v' }) // prints :v
```

In this case the `fn` function wasn't assigned to any of the objects, this was set dynamically via the `call` function.

There are also fat arrow functions, also known as lambda functions:

```sh
const add = (a, b) => a + 1
const cube = (n) => {
  return Math.pow(n, 3)
}
```

When defined without curly braces, the expression following the fat arrow (=>) is the return value of the function. Lambda functions do not have their own `this` context, when `this` is referenced inside a function, it refers to the `this` of the nearest parent non-lambda function.

```sh
function fn() {
  return (offset) => {
   console.log(this.id + offset)
  }
}
const obj = { id: 999 }
const offsetter = fn.call(obj)
offsetter(1) // prints 1000 (999 + 1)
```

While normal functions have a `prototype` property (which will be discussed in detail shortly), fat arrow functions do not:

```sh
function normalFunction () { }
const fatArrowFunction = () => {}
console.log(typeof normalFunction.prototype) // prints 'object'
console.log(typeof fatArrowFunction.prototype) // prints 'undefined'
```

## Prototypal Inheritance (Functional)

At a fundamental level, inheritance in JavaScript is achieved with a chain of prototypes. The approaches around creating prototype chains have evolved significantly over time, as updates to the language have brought new features and syntax.

There are many approaches and variations to creating a prototype chain in JavaScript but we will explore three common approaches

- Functional
- constructor functions
- class-syntax constructors

For the purposes of these examples, we will be using a Wolf and Dog taxonomy, where a Wolf is a prototype of a Dog.

The functional approach to creating prototype chains is to use `Object.create`:

```sh
const wolf = {
    howl: function () {
        console.log(this.name + ': awwwwwwwww')
    }
}

const dog = Object.create(wolf, {
  woof: { value: function() { console.log(this.name + ': woof') } }
})

const rufus = Object.create(dog, {
  name: {value: 'Rufus the dog'}
})

rufus.woof() // prints "Rufus the dog: woof"
rufus.howl() // prints "Rufus the dog: awoooooooo"
```

The `wolf` object is a plain JavaScript object, created with the object literal syntax (i.e. using curly braces). The prototype of plain JavaScript objects is `Object.prototype`.

The `Object.create` function can take two arguments. The first argument is the desired prototype of the object being created.

When the `dog` object is instantiated, the first argument passed to `Object.create` is the `wolf` object. So `wolf` is the prototype of `dog`. When `rufus` is instantiated, the first argument to `Object.create` is `dog`.

To describe the full prototype chain:

- the prototype of `rufus` is `dog`
- the prototype of `dog` is `wolf`
- the prototype of `wolf` is `Object.prototype`.

The second argument of `Object.create` is an optional Properties Descriptor object.

A Properties Descriptor object contains keys that will become the key name on the object being created. The values of these keys are Property Descriptor objects.

The Property Descriptor is a JavaScript object that describes the characteristics of the properties on another object.

The `Object.getOwnPropertyDescriptor` can be used to get a property descriptor on any object.

To complete the functional paradigm as it applies to prototypal inheritance, the creation of an instance of a dog can be genericized with a function:

```sh
const wolf = {
  howl: function () { console.log(this.name + ': awoooooooo') }
}

const dog = Object.create(wolf, {
  woof: { value: function() { console.log(this.name + ': woof') } }
})

function createDog (name) {
  return Object.create(dog, {
    name: {value: name + ' the dog'}
  })
}

const rufus = createDog('Rufus')

rufus.woof() // prints "Rufus the dog: woof"
rufus.howl() // prints "Rufus the dog: awoooooooo"
```

The prototype of an object can be inspected with `Object.getPrototypeOf`:

```sh
console.log(Object.getPrototypeOf(rufus) === dog) //true
console.log(Object.getPrototypeOf(dog) === wolf) //true
```

## Prototypal Inheritance (Class-Syntax Constructors)

Modern JavaScript (EcmaScript 2015) has a `class` keyword. It's important that this isn't confused with the `class` keyword in other Classical OOP languages.

The `class` keyword is syntactic sugar that actually creates a function. Specifically it creates a function that should be called with `new`. It creates a Constructor Function, the very same Constructor Function discussed in the previous section.

This is why it's deliberately referred to here as "Class-syntax Constructors", because the EcmaScript 2015 (ES6) `class` syntax does not in fact facilitate the creation classes as they are traditionally understood in most other languages. It actually creates prototype chains to provide Prototypal Inheritance as opposed to Classical Inheritance.

The `class` syntax sugar does reduce boilerplate when creating a prototype chain:

```sh
class Wolf {
    constructor(name) {
        this.name = name
    }

    howl() {
        console.log(this.name + ': awoooooooo')
    }

}

class Dog extends Wolf {
    constructor(name) {
        super(name + ' the dog')
    }

    woof() {
        console.log(this.name + ': woof')
    }
}

const rufus = new Dog('rufus')
rufus.woof // prints rufus the dog: woof
rufus.howl // prints rufus the dog: awoooooooo
```

This will setup the same prototype chain as in the Functional Prototypal Inheritance and the Function Constructors Prototypal Inheritance examples:

```sh
console.log(Object.getPrototypeOf(rufus) === Dog.prototype) //true
console.log(Object.getPrototypeOf(Dog.prototype) === Wolf.prototype) //true
```

To describe the full prototype chain:

- the prototype of rufus is Dog.prototype
- the prototype of Dog.prototype is Wolf.prototype
- the prototype of Wolf.prototype is Object.prototype.

The `extends` keyword makes prototypal inheritance a lot simpler. In the example code, `class` `Dog` `extends` Wolf will ensure that the prototype of `Dog.prototype` will be `Wolf.prototype`.

The `constructor` method in each class is the equivalent to the function body of a Constructor Function. So for instance `function Wolf (name) { this.name = name }` is the same as `class` `Wolf` `{ constructor (name) { this.name = name } }`.

The `super` keyword in the `Dog` `class` `constructor` method is a generic way to call the parent class `constructor` while setting the this keyword to the current instance. In the Constructor Function example `Wolf.call(this, name + ' the dog')` is equivalent to `super(name + ' the dog')` here.

Any methods other than `constructor` that are defined in the `class` are added to the `prototype` object of the function that the `class` syntax creates.

```sh
class Wolf {
  constructor (name) {
    this.name = name
  }
  howl () { console.log(this.name + ': awoooooooo') }
}
```

This is desugared to:

```sh
function Wolf (name) {
  this.name = name
}

Wolf.prototype.howl = function () {
 console.log(this.name + ': awoooooooo')
}
```

The class syntax based approach is the most recent addition to JavaScript when it comes to creating prototype chains, but is already widely used.

## Closure Scope

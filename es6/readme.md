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


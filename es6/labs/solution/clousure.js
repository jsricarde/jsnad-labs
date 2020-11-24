'use strict'

function prefixer(word) {
    return function saySomehting(name) {
        return `${word}${name}`
    }
}

const sayHiTo = prefixer('Hello ')
const sayByeTo = prefixer('Goodbye ')
console.log(sayHiTo('Dave')) 
// prints 'Hello Dave'console.log(sayHiTo('Annie')) 
// prints 'Hello Annie'console.log(sayByeTo('Dave')) 
// prints 'Goodbye Dave'
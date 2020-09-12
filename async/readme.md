### Callback

A callback is a function that will be called at some future point, once a task has been completed. Until the fairly recent introduction of async/await, which will be discussed shortly, callback functions were the only way to manage asynchronous flow.

Let's take a look at an example readFile call:

```sh
const { readFile } = require('fs')
readFile(__filename, (err, contents) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
})
```
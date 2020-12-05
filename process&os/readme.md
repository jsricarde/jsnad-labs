### STDIO

The ability to interact with terminal input and output is known as standard input/output, or STDIO. The process object exposes three streams:

- `process.stdin`
A Readable stream for process input.
- `process.stdout`
A Writable stream for process output.
- `process.stderr`
A Writable stream for process error output.

Streams were covered in detail earlier on, for any terms that seem unfamiliar, refer back to Section 12 - "Working with Streams".

In order to interface with process.stdin some input is needed. We'll use a simple command that generates random bytes in hex format:

```sh
node -p "crypto.ramdonBytes(100).toString('hex')"
```

Since bytes are randomly generated, this will produce different output every time, but it will always be 200 alphanumeric characters:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-1.png" width="1000" />
  <br />
</p>

Let's extend our code so that we connect `process.stdin` to `process.stdout`:

```sh
'use strict'

console.log('Initialized')

process.stdin.pipe(process.stdout)
```

This will cause the input that we're piping from the random bytes command into our process will be written out from our process:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-2.png" width="1000" />
  <br />
</p>

Since we're dealing with streams, we can take the uppercase stream from the previous chapter and pipe from process.stdin through the uppercase stream and out to process.stdout:





Since we're dealing with streams, we can take the uppercase stream from the previous chapter and pipe from `process.stdin` through the uppercase stream and out to `process.stdout`:

```sh
'use strict'
console.log('initalizated')
const { Transform } = require('stream')

const createTransform = Transform({
  transform: (chunk, enc, next) => {
    next(null, chunk.toString().toUpperCase())
  }
})

process.stdin.pipe(createTransform).pipe(process.stdout)
```

This will cause all the lowercase characters to become uppercase:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-3.png" width="1000" />
  <br />
</p>

It may have been noted that we did not use `pipeline`, but instead used the `pipe` method. The `process.stdin, process.stdout and process.stderr` streams are unique in that they never finish, error or close. That is to say, if one of these streams were to end it would either cause the process to crash or it would end because the process exited. We could use the stream.finished method to check that the uppercase stream doesn't close, but in our case we didn't add error handling to the uppercase stream because any problems that occur in this scenario should cause the process to crash.

The `process.stdin.isTTY` property can be checked to determine whether our process is being piped to on the command line or whether input is directly connected to the terminal. In the latter case `process.stdin.isTTY` will be true, otherwise it is undefined (which we can coerce to false).

At the top of our file we currently have a console.log:

```sh
console.log('initialized')
```

Let's alter it to:

```sh
console.log(process.stdin.isTTY ? 'terminal' : 'piped to')
```

If we now pipe our random bytes command to our script the `console.log` message will indicate that our process is indeed being piped to:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-4.png" width="1000" />
  <br />
</p>

If we execute our code without piping to it, the printed message will indicate that the process is directly connected to the terminal, and we will be able to type input into our process which will be transformed and sent back to us:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-5.png" width="1000" />
  <br />
</p>

We've looked at `process.stdin` and `process.stdout`, let's wrap up this section by looking at `process.stderr`. Typically output sent to stderr is secondary output, it might be error messages, warnings or debug logs.


First, on the command line, let's redirect output to a file:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-6.png" width="1000" />
  <br />
</p>

We can see from this that using the greater than character (>) on the command line sends output to a given file, in our case out.txt.

Now, let's alter the following line in our code:

```sh
console.log(process.stdin.isTTY ? 'terminal' : 'piped to')
```
To:

```sh
process.stderr.write(process.stdin.isTTY ? 'terminal\n' : 'piped to\n')
```

Now, let's run the command redirecting to out.txt as before:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-7.png" width="1000" />
  <br />
</p>

Here we can see that that piped to is printed to the console even though output is sent to out.txt. This is because the console.log function prints to STDOUT and STDERR is a separate output device which also prints to the terminal. So before 'piped to' was written to STDOUT, and therefore redirected to out.txt whereas now it's written to a separate output stream which also writes to the terminal.

Notice that we add a newline (\n) to our strings, this is because the console methods automatically add a newline to inputs. We can also use console.error to write to STDERR. Let's change the log line to:

```sh
console.error(process.stdin.isTTY ? 'terminal' : 'piped to')
```

This will lead to the same result:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-8.png" width="1000" />
  <br />
</p>

While it's beyond the scope of Node, it's worth knowing that if we wanted to redirect the STDERR output to another file on the command line 2> can be used:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-9.png" width="1000" />
  <br />
</p>


This command wrote STDOUT to `out.txt` and STDERR to `err.txt`. On both Windows and POSIX systems (Linux, macOS) the number 2 is a common file handle representing STDERR, this is why the syntax is 2>. In node the process.stderr.fd is 2 and process.stdout.fd is 1 because they are file write streams. It's actually possible to recreate them with the fs module:

```sh
'use strict'
const fs = require('fs')
const myStdout = fs.createWriteStream(null, {fd: 1})
const myStderr = fs.createWriteStream(null, {fd: 2})
myStdout.write('stdout stream')
myStderr.write('stderr stream')
```

The above example is purely for purposes of enhancing understanding, always use `process.stdout` and `process.stderr`, do not try to recreate them as they've been enhanced with other characteristics beyond this basic example.

## Exiting

Some API's have active handles. An active handle is a reference that keeps the process open. For instance, `net.createServer` creates a server with an active handle which will stop the process from exiting by itself so that it can wait for incoming requests. Timeouts and intervals also have active handles that keep the process from exiting:

```sh
'use strict'
setInterval(() => {
  console.log('this interval is keeping the process open')
}, 500)
```

If we run the above code the log line will continue to print every 500ms, we can use Ctrl and C to exit:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-10.png" width="1000" />
  <br />
</p>


To force a process to exit at any point we can call `process.exit`.

```sh
'use strict'

setInterval(()=>{
  console.log('this replied by interval')  
}, 500)

setTimeout(()=>{
  console.log('this process are going to exit')  
  process.exit()
}, 1750)
```

This will cause the process to exit after the function passed to setInterval has been called three times:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-11.png" width="1000" />
  <br />
</p>

When exiting a process an exit status code can already be set. Status codes are a large subject, and can mean different things on different platforms. The only exit code that has a uniform meaning across platforms is 0. An exit code of 0 means the process executed successfully. On Linux and macOS (or more specifically, Bash, Zsh, Sh, and other *nix shells) we can verify this with the command echo $? which prints a special variable called $?. On a Windows cmd.exe terminal we can use echo %ErrorLevel% instead or in PowerShell the command is $LastExitCode. In the following examples, we'll be using echo $? but substitute with the relevant command as appropriate.

If we run our code again and look up the exit code we'll see that is 0:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-12.png" width="1000" />
  <br />
</p>

We can pass a different exit code to `process.exit`. Any non-zero code indicates failure, and to indicate general failure we can use an exit code of 1 (technically this means "Incorrect function" on Windows but there's a common understanding that 1 means general failure).

Let's modify our `process.exit` call to pass 1 to it:

```sh
'use strict'

setInterval(()=>{
  console.log('this replied by interval')  
}, 500)

setTimeout(()=>{
  console.log('this process are going to exit')  
  process.exit(1)
}, 1750)
```

Now, if we check the exit code after running the process it should be 1:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-13.png" width="1000" />
  <br />
</p>

The exit code can also be set independently be assigning `process.exitCode`:

```sh
'use strict'
setInterval(()=>{
  console.log('this replied by interval')  
  process.exitCode = 1
}, 500)

setTimeout(()=>{
  console.log('this process are going to exit')  
  process.exit()
}, 1750)
```

This will result in the same outcome:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-14.png" width="1000" />
  <br />
</p>

The 'exit' event can also used to detect when a process is closing and perform any final actions, however no asynchronous work can be done in the event handler function because the process is exiting:

```sh
'use strict'
setInterval(()=>{
  console.log('this replied by interval')  
  process.exitCode = 1
}, 500)

setTimeout(()=>{
  console.log('this process are going to exit')  
  process.exit()
}, 1750)

process.on('exit', (code) => {
  console.log('exiting with code', code)
  setTimeout(() => {
    console.log('this will never happen')
  }, 1)
})
```

This will result in the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-14.png" width="1000" />
  <br />
</p>

## Process Info

Naturally the `process` object also contains information about the process, we'll look at a few here:

- The current working directory of the process
- The platform on which the process is running
- The Process ID
- The environment variables that apply to the process
There are other more advanced things to explore, but see the Node.js Documentation for a comprehensive overview.

Let's look at the first three bullet points in one code example:

```sh
'use strict'
console.log('Current Directory', process.cwd())
console.log('Process Platform', process.platform)
console.log('Process ID', process.pid)
```

This produces the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-16.png" width="1000" />
  <br />
</p>

The current working directory is whatever folder the process was executed in. The `process.chdir` command can also change the current working directory, in which case `process.cwd() ` would output the new directory.

The process platform indicates the host Operating System. Depending on the system it can be one of:

- '`aix`' – IBM AIX
- '`darwin`' – macOS
- '`freebsd`' – FreeBSD
- '`linux`' – Linux
- '`openbsd`' – OpenBSD
- '`sunos`' – Solaris / Illumos / SmartOS
- '`win32`' – Windows
- '`android`' – Android, experimental

As we'll see in a future section the os module also has a platform function (rather than property) which will return the same values for the same systems as exist on `process.platform`.

To get the environment variables we can use `process.env`:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-17.png" width="1000" />
  <br />
</p>

Environment variables are key value pairs, when process.env is accessed, the host environment is dynamically queried and an object is built out of the key value pairs. This means process.env works more like a function, it's a getter. When used to set environment variables, for instance process.env.FOO='my env var' the environment variable is set for the process only, it does not leak into the host operating system.

Note that process.env.PWD also contains the current working directory when the process executes, just like process.cwd() returns. However if the process changes its directory with process.chdir, process.cwd() will return the new directory whereas process.env.PWD continues to store the directory that process was initially executed from.

## Process Stats

The process object has methods which allow us to query resource usage, we're going to look at the `process.uptime()`, `process.cpuUsage` and `process.memoryUsage` functions.

Let's take a look at `process.uptime`:

```sh
'use strict'
console.log('Process Uptime', process.uptime())
setTimeout(() => {
  console.log('Process Uptime', process.uptime())
}, 1000)
```

This produces the following output:

<img src="https://github.com/jsricarde/jsnad-labs/raw/master/process&os/imgs/os-18.png" width="1000" />
  <br />
</p>
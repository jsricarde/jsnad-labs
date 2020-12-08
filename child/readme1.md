## Child Process Creation

The `child_process` has the following methods, all of which spawn a process some way or another.
-  `exc` && `execSync`.
-  `spawn` & `spawnSync`
-  `execFile` & `execSyncFile`
-  `fork`

### `fork` Method

The `fork` method is a specialization of the spawn method. By default, it will `spawn` a new Node process of the currently executing JavaScript file (although a different JavaScript file to execute can be supplied). It also sets up Interprocess Communication (IPC) with the subprocess by default.

### `execSync` Method

The `child_process.execSync` method is the simplest way to execute a command:

```sh
'use strict'

const { execSync } = require('child_process')

const output = execSync(
  `node -e "console.log('subprocess stdio output')"`
)

console.log(output.toString())
```

The `execSync` method returns a buffer containing the output of the command. This is both `STDOUT` and `STDERR` output.

Let's change the code so that the subprocess prints to `STDERR` instead like so:

```sh
'use strict'

const { execSync } = require('child_process')

const output = execSync(
  `node -e "console.error('subprocess stdio output')"`
)

console.log(output.toString())
```

If the code is executed again it will be the same result.

In the example code the command being executed happens to be the node binary. However any command that is available on the host machine can be executed:

```sh
'use strict'

const { execSync } = require('child_process')

const cmd = process.platform === 'win32' ? 'dir' : 'ls'

const output = execSync(cmd)

console.log(output.toString())
```

In this example we used `process.platform` to determine the platform so that we can execute the equivalent command on Windows and non-Windows Operating Systems.

If we do want to execute the node binary as a child process, it's best to refer to the full path of the node binary of the currently executing Node process. This can be found with `process.execPath`:

```sh
node -p process.execPath
```

Using `process.execPath` ensures that no matter what, the subprocess will be executing the same version of Node.

The following is the same example from earlier, but using process.execPath in place of just '`node`':

```sh
'use strict'
const { execSync } = require('child_process')
const output = execSync(
  `${process.execPath} -e "console.error('subprocess stdio output')"`
)
console.log(output.toString())
```

If the subprocess exits with a non-zero exit code, the execSync function will throw:


```sh
'use strict'

const  { execSync } = require('child_process')

try {
  execSync(`${process.execPath} -e "process.exit(1)"`)
} catch (err) {
  console.error('CAUGHT ERROR:', err)
}
```

Let's modify our code to throw an error instead:

```sh
'use strict'
const { execSync } = require('child_process')

try {
  execSync(`${process.execPath} -e "throw Error('kaboom')"`)
} catch (err) {
  console.error('CAUGHT ERROR:', err)
}
```

### `exec` Method

The first section of output where we have printed CAUGHT ERROR is the error output of the subprocess. This same output is contained in the buffer object of `err.stderr` and `err.output[2]`.

When we log the error, it's preceded by a message saying that the command failed and prints two stacks with a gap between them. The first stack is the functions called inside the subprocess, the second stack is the functions called in the parent process.

Also notice that an uncaught throw in the subprocess results in an `err.status` (the exit code) of 1 as well, to indicate generic failure.

The exec method takes a shell command as a string and executes it the same way as `execSync`. Unlike execSync the asynchronous exec function splits the `STDOUT` and `STDERR` output by passing them as separate arguments to the callback function:

```sh
'use strict'

const { exec } = require('child_process')

exec(`${process.execPath} -e "console.log('A');console.error('B')"`,
  (err, stdout, stderr) => {
    console.log('err', err)
    console.log('subprocess stdout:',  stdout.toString())
    console.log('subprocess stderror:',  stderr.toString())
  }
)
```

Even though `STDERR` was written to, the first argument to the callback, err is null. This is because the process ended with zero exit code. Let's try throwing an error without catching it in the subprocess:

```sh
'use strict'

const { exec } = require('child_process')

exec(`${process.execPath} -e "console.log('A'); throw Error('B')"`,
  (err, stdout, stderr) => {
    console.log('err', err)
    console.log('subprocess stdout:',  stdout.toString())
    console.log('subprocess stderror:',  stderr.toString())
  }
)
```

The `err` passed to the callback is no longer `null`, it's an error object. In the asynchronous exec case `err.code` contains the exit code instead of `err.status`, which is an unfortunate API inconsistency. It also doesn't contain the STDOUT or STDERR buffers since they are passed to the callback function independently.

The `err` object also contains two stacks, one for the subprocess followed by a gap and then the stack of the parent process. The subprocess stderr buffer also contains the error as presented by the subprocess.

### `spawnSync` Method

While `exec` and `execSync` take a full shell command, `spawn` takes the executable path as the first argument and then an array of flags that should be passed to the command as second argument:

```sh
'use strict'

const { spawnSync } = require('child_process')

const result = spawnSync(
  process.execPath,
  ['-e', `console.log('subprocess stdio output')`]
)

console.log(result)
```

While the `execSync` function returns a buffer containing the child process output, the `spawnSync` function returns an object containing information about the process that was spawned. We assigned this to the result constant and logged it out. This object contains the same properties that are attached to the error object when `execSync` throws. The `result.stdout` property (and `result.output[1]`) contains a buffer of our processes `STDOUT` output, which should be 'subprocess stdio output'. Let's find out by updating the `console.log(result)` line to:

```sh
console.log(result.stdout.toString())
```

Unlike `execSync`, the `spawnSync` method does not need to be wrapped in a `try/catch`. If a `spawnSync` process exits with a non-zero exit code, it does not throw:

```sh
'use strict'
const { spawnSync } = require('child_process')
const result = spawnSync(process.execPath, [`-e`, `process.exit(1)`])
console.log(result)
```

We can see that the `status` property is set to 1, since we passed an exit code of 1 to `process.exit` in the child process. If we had thrown an error without catching it in the subprocess the exit code would also be 1, but the `result.stderr` buffer would contain the subprocess STDERR output displaying the thrown error message and stack.

### `spawn` Method

Let's take a look at a spawn example:

```sh
'use strict'

const { spawn } = require('child_process')

const sp = spawn(
  process.execPath,
  [`-e`, `console.log('subprocess stdio output')`]
)

console.log('pid is', sp.pid)

sp.stdout.pipe(process.stdout)

sp.on('close', (status) => {
  console.log('exit status was', status)
})
```

The spawn method returns a `ChildProcess` instance which we assigned to the sp constant. The `sp.pid` (Process ID) is immediately available so we `console.log` this right away. To get the `STDOUT` of the child process we pipe sp.stdout to the parent `process.stdout`. This results in our second line of output which says subprocess stdio output. To get the status code, we listen for a close event. When the child process exits, the event listener function is called, and passes the exit code as the first and only argument. This is where we print our third line of output indicating the exit code of the subprocess.

The `exec` command doesn't have to take a callback, and it also returns a `ChildProcess` instance:

```sh
'use strict'
const { exec } = require('child_process')
const sp = exec(
  `${process.execPath} -e "console.log('subprocess stdio output')"`
)

console.log('pid is', sp.pid)

sp.stdout.pipe(process.stdout)

sp.on('close', (status) => {
  console.log('exit status was', status)
})
```
This leads to the exact same outcome as the equivalent `spawn` example.

The `spawn` method and the `exec` method both returning a `ChildProcess` instance can be misleading. There is one highly important differentiator between `spawn` and the other three methods we've been exploring (namely `exec`, `execSync` and `spawnSync`): the `spawn` method is the only method of the four that doesn't buffer child process output. Even though the `exec` method has stdout and stderr streams, they will stop streaming once the subprocess output has reached 1 mebibyte (or 1024 * 1024 bytes). This can be configured with a `maxBuffer` option, but no matter what, the other three methods have an upper limit on the amount of output a child process can generate before it is truncated. Since the `spawn` method does not buffer at all, it will continue to stream output for the entire lifetime of the subprocess, no matter how much output it generates. Therefore, for long running child processes it's recommended to use the `spawn` method.

### Process Configuration

An options object can be passed as a third argument in the case of spawn and `spawnSync` or the second argument in the case of exec and `execSync`.

We'll explore two options that can be passed which control the environment of the child process: `cwd` and env.

We'll use `spawn` for our example but these options are universally the same for all the child creation methods.

By default, the child process inherits the environment variables of the parent process:

```sh
'use strict'

const { spawn } = require('child_process')

process.env.A_VAR_WE = 'JUST SET'

const sp = spawn(
  process.execPath, ['-p', 'process.env']
)

sp.stdout.pipe(process.stdout)
```

This example code creates a child process that executes `node` with the `-p` flag so that it immediately prints `process.env` and exits. The `stdout` stream of the child process is piped to the stdout of the parent process. So when executed this code will output the environment variables of the child process

If we pass an options object with an `env` property the parent environment variables will be overwritten:

```sh
'use strict'

const { spawn } = require('child_process')

process.env.A_VAR_WE = 'JUST SET'

const sp = spawn(process.execPath, ['-p', 'process.env'], {
  env: {SUBPROCESS_SPECIFIC: 'ENV VAR'}
})

sp.stdout.pipe(process.stdout)
```

We've modified the code so that an `env` object is passed via the options object, which contains a single environment variable named `SUBPROCESS_SPECIFIC`. When executed, the parent process will output the child process' environment variables object, and they'll only contain what we passed via the `env` option:

### Child STDIO
So far we've covered that the asynchronous child creation methods (`exec` and `spawn`) return a ChildProcess instance which has `stdin`, `stdout` and `stderr` streams representing the I/O of the subprocess.

This is the default behavior, but it can be altered.

Let's start with an example with the default behavior:

```sh
'use strict'
const { spawn } = require('child_process')
const sp = spawn(
  process.execPath,
  [
   '-e',
   `console.error('err output'); process.stdin.pipe(process.stdout)`
  ],
  { stdio: ['pipe', 'pipe', 'pipe'] }
)

sp.stdout.pipe(process.stdout)
sp.stderr.pipe(process.stdout)
sp.stdin.write('this input will become output\n')
sp.stdin.end()
```

The options object has an `stdio` property set to `['pipe', 'pipe', 'pipe']`. This is the default, but we've set it explicitly as a starting point. In this context `pipe` means expose a stream for a particular `STDIO` device.

As with the output property in `execSync` error objects or `spawnSync` result objects, the `stdio` array indices correspond to the file descriptors of each `STDIO` device. So the first element in the `stdio` array (index 0) is the setting for the child process `STDIN`, the second element (index 1) is for `STDOUT` and the third (index 2) is for `STDERR`.

The process we are spawning is the node binary with the `-e` flag set to evaluate code which pipes the child process STDIN to its STDOUT and then outputs 'err output' (plus a newline) to STDERR using `console.error`.

In the parent process we pipe from the child process' `STDOUT` to the parent process' `STDOUT`. We also pipe from the child process' `STDERR` to the parent process' `STDOUT`. Note this is not a mistake, we are deliberately piping from child `STDERR` to parent `STDOUT`. The subprocess `STDIN` stream (`sp.stdin`) is a writable stream since it's for input. We write some input to it and then call `sp.stdin.end()` which ends the input stream, allowing the child process to exit which in turn allows the parent process to exit.

If we're piping the subprocess `STDOUT` to the parent process `STDOUT` without transforming the data in any way, we can instead set the second element of the stdio array to `'inherit'`. This will cause the child process to inherit the `STDOUT` of the parent:

```sh
'use strict'
const { spawn } = require('child_process')
const sp = spawn(
  process.execPath,
  [
   '-e',
   `console.error('err output'); process.stdin.pipe(process.stdout)`
  ],
  { stdio: ['pipe', 'inherit', 'pipe'] }
)

sp.stderr.pipe(process.stdout)
sp.stdin.write('this input will become output\n')
sp.stdin.end()
```
We've changed the `stdio[1]` element from `'pipe'` to `'inherit'` and removed the `sp.stdout.pipe(process.stdout)` line (in fact `sp.stdout` would now be null). This will result in the exact same output:

```sh
'use strict'
const { spawn } = require('child_process')
const sp = spawn(
  process.execPath,
  [
   '-e',
   `console.error('err output'); process.stdin.pipe(process.stdout)`
  ],
  { stdio: ['pipe', 'inherit', process.stdout] }
)

sp.stdin.write('this input will become output\n')
sp.stdin.end()
```

Now both sp.stdout and `sp.stderr` will be null because neither of them are configured to `'pipe'` in the `stdio` option. However it will result in the same output because the third element in `stdio` is the `process.stdout` stream

In our case we passed the `process.stdout` stream via `stdio` but any writable stream could be passed in this situation, for instance a file stream, a network socket or an HTTP response.

Let's imagine we want to filter out the `STDERR` output of the child process instead of writing it to the parent `process.stdout` stream we can change `stdio[2]` to `'ignore'`. As the name implies this will ignore output from the `STDERR` of the child process:

```sh
'use strict'
const { spawn } = require('child_process')
const sp = spawn(
  process.execPath,
  [
   '-e',
   `console.error('err output'); process.stdin.pipe(process.stdout)`
  ],
  { stdio: ['pipe', 'inherit', 'ignore'] }
)

sp.stdin.write('this input will become output\n')
sp.stdin.end()
```

This change will change the output as the child process `STDERR` output is now ignored.

The `stdio` option applies the same way to the `child_process.exec` function.

To send `input` to a child process created with `spawn` or `exec` we can call the write method of the return `ChildProcess` instance. For the `spawnSync` and `execSync` functions an input option be used to achieve the same:

```sh
'use strict'
const { spawnSync } = require('child_process')

spawnSync(
  process.execPath,
  [
   '-e',
   `console.error('err output'); process.stdin.pipe(process.stdout)`
  ],
  {
    input: 'this input will become output\n',
    stdio: ['pipe', 'inherit', 'ignore']
  }
)
```

This will create the same output as the previous example because we've also set `stdio[2]` to 'ignore', thus `STDERR` output is ignored.


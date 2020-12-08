## Child Process Creation

The `child_process` module has the following methods, all of which spawn a process some way or another:

- `exec` and `execSync`
- `spawn` and `spawnSync`
- `fork`
- `execFile` and `execFileSync`

In this section we're going to zoom in on the `exec` and `spawn` methods (including their synchronous forms). However, before we do that, let's briefly cover the other listed methods.

## execFile & execFileSync Methods

The `execFile` and `execFileSync` methods are variations of the `exec` and `execSync` methods. Rather than defaulting to executing a provided command in a shell, it attempts to execute the provided path to a binary executable directly. This is slightly more efficient but at the cost of some features. See the execFile Documentation for more information.


## fork Method

The `fork` method is a specialization of the `spawn` method. By default, it will `spawn` a new Node process of the currently executing JavaScript file (although a different JavaScript file to execute can be supplied). It also sets up Interprocess Communication (IPC) with the subprocess by default. See fork Documentation to learn more.

## exec & execSync Methods

The `child_process.execSync` method is the simplest way to execute a command:

```sh
'use strict'

const { execSync } = require('child_process')

const output = execSync(`node - "console.log('subprocess stdio output')"`)

console.log(output.toString())
```

This should result in the following outcome:


<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-1.png" width="1000" />
  <br />
</p>

The `execSync` method returns a buffer containing the output of the command. This is both `STDOUT` and `STDERR` output.

Let's change the code so that the subprocess prints to `STDERR` instead like so:

```sh
'use strict'

const { execSync } = require('child_process')

const output = execSync(`node - "console.error('subprocess stdio output')"`)

console.log(output.toString())
```

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-1.png" width="1000" />
  <br />
</p>

While execSync outputs both STDOUT and STDERR this behavior can be configured, but we'll find out more about that in the "Child STDIO" section later in this chapter.

In the example code the command being executed happens to be the node binary. However any command that is available on the host machine can be executed:

```sh
'use strict'
const { execSync } = require('child-process')

const cmd = process.platform === 'win32' ? 'dir' : 'ls'

execSync(cmd)

console.log(output)
```

In this example we used process.platform to determine the platform so that we can execute the equivalent command on Windows and non-Windows Operating Systems:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-2.png" width="1000" />
  <br />
</p>

If we do want to execute the node binary as a child process, it's best to refer to the full path of the node binary of the currently executing Node process. This can be found with `process.execPath:`

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-3.png" width="1000" />
  <br />
</p>

Using `process.execPath` ensures that no matter what, the subprocess will be executing the same version of Node.

The following is the same example from earlier, but using `process.execPath` in place of just '`node`':

```sh
'use strict'
const { execSync } = require('child_process')
const output = execSync(
  `${process.execPath} -e "console.error('subprocess stdio output')"`
)
console.log(output.toString())
```

If the subprocess exits with a non-zero exit code, the `execSync` function will throw:

```sh
'use strict'
const { execSync } = require('child_process')

try {
  execSync(`${process.execPath} -e "process.exit(1)"`)
} catch (err) {
  console.error('CAUGHT ERROR:', err)
}
```

This will result in the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-4.png" width="1000" />
  <br />
</p>

The error object that we log out in the catch block has some additional properties. We can see that status is 1, this is because our subprocess invoked process.exit(1). In a non-zero exit code scenario, the stderr property of the error object can be very useful. The output array indices correspond to the standard I/O file descriptors. Recall from the previous chapter that the file descriptor of STDERR is 2. Ergo the err.stderr property will contain the same buffer as err.output[2], so err.stderr or err.output[2] can be used to discover any error messages written to STDERR by the subprocess. In our case, the STDERR buffer is empty.

Let's modify our code to throw an error instead:

```sh
'use strict'
const { execSync } = require('child_process')

try {
  execSync(`${process.execPath} -e "throw Error('Kabooom')"`)
} catch (err) {
  console.error('CAUGHT ERROR:', err)
}
```

This will result in the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-5.png" width="1000" />
  <br />
</p>

The first section of output where we have printed `CAUGHT ERROR` is the error output of the subprocess. This same output is contained in the buffer object of `err.stderr` and `err.output[2]`.

When we log the error, it's preceded by a message saying that the command failed and prints two stacks with a gap between them. The first stack is the functions called inside the subprocess, the second stack is the functions called in the parent process.

Also notice that an uncaught `throw` in the subprocess results in an `err.status` (the exit code) of 1 as well, to indicate generic failure.

The `exec` method takes a shell command as a string and executes it the same way as `execSync`. Unlike `execSync` the asynchronous `exec` function splits the `STDOUT` and `STDERR` output by passing them as separate arguments to the callback function:

```sh
'use strict'
const { exec } = require('child-process')

exec(`${process.execPath} -e "console.log('A');console.error('B')"`, (err, stdout, stderr) => {
    if (err) {
        console.log('err', err)
        return
    }
    console.log('subprocess stdout: ', stdout.toString())
    console.log('subprocess stderr: ', stderr.toString())
})
```

The above code example results in the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-5.png" width="1000" />
  <br />
</p>

Even though `STDERR` was written to, the first argument to the callback, `err` is `null`. This is because the process ended with zero exit code. Let's try throwing an error without catching it in the subprocess:

```sh
'use strict'
const { exec } = require('child-process')

exec(`${process.execPath} -e "console.log('A'); throw Error('B')"`, (err, stdout, stderr) => {
    if (err) {
        console.log('err', err)
        return
    }
    console.log('subprocess stdout: ', stdout.toString())
    console.log('subprocess stderr: ', stderr.toString())
})
```

This will result in the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-7.png" width="1000" />
  <br />
</p>

The `err` passed to the callback is no longer null, it's an error object. In the asynchronous `exec` case `err.code` contains the exit code instead of `err.status`, which is an unfortunate API inconsistency. It also doesn't contain the `STDOUT` or `STDERR` buffers since they are passed to the callback function independently.

The `err` object also contains two stacks, one for the subprocess followed by a gap and then the stack of the parent process. The subprocess `stderr` buffer also contains the error as presented by the subprocess.


## spawn & spawnSync Methods

While exec and `execSync` take a full shell command, `spawn` takes the executable path as the first argument and then an array of flags that should be passed to the command as second argument:

```sh
'use strict'
const { spawnSync } = require('child-process')

const result = spawnSync(
    process.execPath, 
    ['-e', `console.log('subprocess stdio output')`]
)

console.log(result)
```

In this example `process.execPath` (e.g. the full path to the node binary) is the first argument passed to `spawnSync` and the second argument is an array. The first element in the array is the first flag: `-e`. There's a space between the `-e` flag and the content that the flag instructs the node binary to execute. Therefore that content has to be the second argument of the array. Also notice the outer double quotes are removed. Executing this code results in the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-8.png" width="1000" />
  <br />
</p>

While the execSync function returns a buffer containing the child process output, the spawnSync function returns an object containing information about the process that was spawned. We assigned this to the result constant and logged it out. This object contains the same properties that are attached to the error object when execSync throws. The result.stdout property (and result.output[1]) contains a buffer of our processes STDOUT output, which should be 'subprocess stdio output'. Let's find out by updating the console.log(result) line to:

```sh
console.log(result.stdout.toString())
```

Executing the updated code should verify that the result object contains the expected `STDOUT` output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-10.png" width="1000" />
  <br />
</p>

Unlike `execSync`, the `spawnSync` method does not need to be wrapped in a `try/catch`. If a `spawnSync` process exits with a non-zero exit code, it does not throw:

```sh
'use strict'
const { spawnSync } = require('child_process')
const result = spawnSync(process.execPath, [`-e`, `process.exit(1)`])
console.log(result)
```

The above, when executed, will result in the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-9.png" width="1000" />
  <br />
</p>

We can see that the `status` property is set to 1, since we passed an exit code of 1 to `process.exit` in the child process. If we had thrown an error without catching it in the subprocess the exit code would also be 1, but the `result.stderr` buffer would contain the subprocess `STDERR` output displaying the thrown error message and stack.

Just as there are differences between `execSync` and `spawnSync` there are differences between `exec` and `spawn`.

While `exec` accepts a callback, `spawn` does not. Both `exec` and `spawn` return a `ChildProcess` instance however, which has `stdin`, `stdout` and `stderr` streams and inherits from `EventEmitter` allowing for exit code to be obtained after a close event is emitted. See `ChildProcess` constructor Documentation for more details.

Let's take a look at a `spawn` example:

```sh
'use strict'

const { spawn } = require('child-process')

const sp = spawn(process.execPath,
  [`-e`, `console.log('subprocess stdio output')`]
)

console.log('pid is', sp.pid)

sp.stdout.pipe(process.stdout)

sp.on('close', (status) => {
  console.log('exit status was', status)
})
```

This results in the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-11.png" width="1000" />
  <br />
</p>

The `spawn` method returns a `ChildProcess` instance which we assigned to the sp constant. The sp.pid (Process ID) is immediately available so we console.log this right away. To get the STDOUT of the child process we pipe sp.stdout to the parent process.stdout. This results in our second line of output which says subprocess stdio output. To get the status code, we listen for a close event. When the child process exits, the event listener function is called, and passes the exit code as the first and only argument. This is where we print our third line of output indicating the exit code of the subprocess.

The `spawn` invocation in our code, is currently:

```sh
const sp = spawn(
  process.execPath,
  [`-e`, `console.log('subprocess stdio output')`]
)
```

Let's alter it to the following:

```sh
const sp = spawn(
  process.execPath,
  [`-e`, `process.exit(1)`]
)
```

Running this altered example code will produce the following outcome:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-12.png" width="1000" />
  <br />
</p>

There is no second line of output in our main process in this case as our code change removed any output to STDOUT.

The exec command doesn't have to take a callback, and it also returns a `ChildProcess` instance:

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

This leads to the exact same outcome as the equivalent `spawn` example:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-13.png" width="1000" />
  <br />
</p>

The `spawn` method and the `exec` method both returning a `ChildProcess` instance can be misleading. There is one highly important differentiator between `spawn` and the other three methods we've been exploring (namely `exec`, `execSync` and `spawnSync`): the `spawn` method is the only method of the four that doesn't buffer child process output. Even though the exec method has stdout and stderr streams, they will stop streaming once the subprocess output has reached 1 mebibyte (or 1024 * 1024 bytes). This can be configured with a maxBuffer option, but no matter what, the other three methods have an upper limit on the amount of output a child process can generate before it is truncated. Since the `spawn` method does not buffer at all, it will continue to stream output for the entire lifetime of the subprocess, no matter how much output it generates. Therefore, for long running child processes it's recommended to use the `spawn` method.

## Process Configuration

An options object can be passed as a third argument in the case of `spawn` and `spawnSync` or the second argument in the case of `exec` and `execSync`.

We'll explore two options that can be passed which control the environment of the child process: `cwd` and `env`.

We'll use `spawn` for our example but these options are universally the same for all the child creation methods.

By default, the child process inherits the environment variables of the parent process:

```sh
'use strict'
const spawn = require('child-process')

process.env.A_VAR_WE = 'JUST SET'
const sp = spawm(process,execPath,
    ['-p', 'process.env']
)
sp.stdout.pipe(process.stdout)
```

This example code creates a child process that executes node with the `-p` flag so that it immediately prints `process.env` and exits. The `stdout` stream of the child process is piped to the `stdout` of the parent process. So when executed this code will output the environment variables of the child process:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-14.png" width="1000" />
  <br />
</p>

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

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-15.png" width="1000" />
  <br />
</p>

Another option that can be set when creating a child process is the `cwd` option:

```sh
'use strict'
const { IS_CHILD } = process.env

if (IS_CHILD) {
  console.log('Subprocess cwd:', process.cwd())
  console.log('env', process.env)
} else {
  const { parse } = require('path')
  const { root } = parse(process.cwd())
  const { spawn } = require('child_process')
  const sp = spawn(process.execPath, [__filename], {
    cwd: root,
    env: {IS_CHILD: '1'}
  })

  sp.stdout.pipe(process.stdout)
}
```

In this example, we're executing the same file twice. Once as a parent process and then once as a child process. We spawn the child process by passing __filename, inside the arguments array passed to spawn. This means the child process will run node with the path to the current file.

We pass an env option to spawn, with an IS_CHILD property set to a string ('1'), so that when the subprocess loads, it will enter the if block. Whereas in the parent process, process.env.IS_CHILD is undefined so when the parent process executes it will enter the else block, which is where the child process is spawned.

The root property of the object returned from parse(process.cwd()) will be different depending on platform, and on Windows, depending on the hard drive that the code is executed on. By setting the cwd option to root we're setting the current working directory of the child process to our file systems root directory path.

In the child process, IS_CHILD will be truthy so the if branch will print out the child processes' current working directory and environment variables. Since the parent process pipes the sp.stdout stream to the process.stdout stream executing this code will print out the current working directory and environment variables of the child process, that we set via the configuration options:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-16.png" width="1000" />
  <br />
</p>

The cwd and env options can be set for any of the child process methods discussed in the prior section, but there are other options that can be set as well. To learn more see spawn options, spawnSync options, exec options and execSync options in the Node.js Documentation.

## Child STDIO

So far we've covered that the asynchronous child creation methods (exec and spawn) return a ChildProcess instance which has stdin, stdout and stderr streams representing the I/O of the subprocess.

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

The options object has an stdio property set to ['pipe', 'pipe', 'pipe']. This is the default, but we've set it explicitly as a starting point. In this context pipe means expose a stream for a particular STDIO device.

As with the output property in execSync error objects or spawnSync result objects, the stdio array indices correspond to the file descriptors of each STDIO device. So the first element in the stdio array (index 0) is the setting for the child process STDIN, the second element (index 1) is for STDOUT and the third (index 2) is for STDERR.

The process we are spawning is the node binary with the -e flag set to evaluate code which pipes the child process STDIN to its STDOUT and then outputs 'err output' (plus a newline) to STDERR using console.error.

In the parent process we pipe from the child process' STDOUT to the parent process' STDOUT. We also pipe from the child process' STDERR to the parent process' STDOUT. Note this is not a mistake, we are deliberately piping from child STDERR to parent STDOUT. The subprocess STDIN stream (sp.stdin) is a writable stream since it's for input. We write some input to it and then call sp.stdin.end() which ends the input stream, allowing the child process to exit which in turn allows the parent process to exit.

This results in the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-17.png" width="1000" />
  <br />
</p>

If we're piping the subprocess STDOUT to the parent process STDOUT without transforming the data in any way, we can instead set the second element of the stdio array to 'inherit'. This will cause the child process to inherit the STDOUT of the parent:

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

We've changed the stdio[1] element from 'pipe' to 'inherit' and removed the sp.stdout.pipe(process.stdout) line (in fact sp.stdout would now be null). This will result in the exact same output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-18.png" width="1000" />
  <br />
</p>

The stdio option can also be passed a stream directly. In our example, we're still piping the child process STDERR to the parent process STDOUT. Since process.stdout is a stream, we can set stdio[2] to process.stdout to achieve the same effect:

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

Now both sp.stdout and sp.stderr will be null because neither of them are configured to 'pipe' in the stdio option. However it will result in the same output because the third element in stdio is the process.stdout stream:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-19.png" width="1000" />
  <br />
</p>

In our case we passed the process.stdout stream via stdio but any writable stream could be passed in this situation, for instance a file stream, a network socket or an HTTP response.

Let's imagine we want to filter out the STDERR output of the child process instead of writing it to the parent process.stdout stream we can change stdio[2] to 'ignore'. As the name implies this will ignore output from the STDERR of the child process:

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

This change will change the output as the child process STDERR output is now ignored:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-20.png" width="1000" />
  <br />
</p>

The stdio option applies the same way to the child_process.exec function.

To send input to a child process created with spawn or exec we can call the write method of the return ChildProcess instance. For the spawnSync and execSync functions an input option be used to achieve the same:

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

This will create the same output as the previous example because we've also set stdio[2] to 'ignore', thus STDERR output is ignored.


For the input option to work for spawnSync and execSync the stdio[0] option has to be pipe, otherwise the input option is ignored.

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/child/imgs/child-21.png" width="1000" />
  <br />
</p>

For more on child process STDIO see Node.js Documentation.





## Child Process Creation

The `child_process` has the following methods, all of which spawn a process some way or another.
-  `exc` && `execSync`.
-  `spawn` & `spawnSync`
-  `execFile` & `execSyncFile`
-  `fork`

### `fork` Method

The `fork` method is a specialization of the spawn method. By default, it will `spawn` a new Node process of the currently executing JavaScript file (although a different JavaScript file to execute can be supplied). It also sets up Interprocess Communication (IPC) with the subprocess by default.

### `exec` & `execSync` Methods

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
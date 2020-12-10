## Printing Command Options

To see all Node command line flags for any version of Node, execute `node --help` and view the output.

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/cli/imgs/cli-1.png" width="1000" />
  <br />
</p>

Beyond the Node command line flags there are additional flags for modifying the JavaScript runtime engine: V8. To view these flags run node `--v8-options`.

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/cli/imgs/cli-2.png" width="1000" />
  <br />
</p>

## Checking Syntax

It’s possible to parse a JavaScript application without running it in order to just check the syntax.

This can be useful on occasions where running code has a setup/teardown cost, for instance, needing to clear a database, but there’s still a need to check that the code parses. It can also be used in more advanced cases where code has been generated and a syntax check is required.

To check the syntax of a program (which will be called app.js), use `--check` or `-c` flag:

```sh
node --check app.js

node -c app.js
```

If the code parses successfully, there will be no output. If the code does not parse and there is a syntax error, the error will be printed to the terminal.

## Dynamic Evaluation


Node can directly evaluate code from the shell. This is useful for quickly checking a code snippet or for creating very small cross-platform commands that use JavaScript and Node core API’s.

There are two flags that can evaluate code. The `-p` or `--print` flag evaluates an expression and prints the result, the `-e` or `--eval` flag evaluates without printing the result of the expression.

The following will print 2

```sh
node --print "1+1"
```

The following will not print anything because the expression is evaluated but not printed.

```sh
node --eval "1+1"
```

The following will print 2 because `console.log` is used to explicitly write the result of 1+1 to the terminal:

```sh
node -e "console.log(1+1)"
```

When used with print flag the same will print 2 and then print undefined because `console.log` returns undefined; so the result of the expression is undefined:

```sh
node -p "console.log(1+1)"
```

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/cli/imgs/cli-3.png" width="1000" />
  <br />
</p>

Usually a module would be required, like so: `require('fs')`, however all Node core modules can be accessed by their namespaces within the code evaluation context.

For example, the following would print all the files with a .js extension in the current working directory in which the command is run:

```sh
node -p "fs.readdirSync('.').filter((f) => /.js$/.test(f))"
```

Due to the fact that Node is cross-platform, this is a consistent command that can be used on Linux, MacOS or Windows. To achieve the same effect natively on each OS a different approach would be required for Windows vs Linux and Mac OS.

## Preloading Modules

The command line flag `-r` or `--require` can be used to preload a module before anything else loads.

Given a file named `preload.js` with the following content:

```sh
console.log('preload.js: this is preloaded')
```

And a file called `app.js` containing the following:

```sh
console.log('app.js: this is the main file')
```

The following command would print `preload.js`: this is preloaded followed by `app.js`: this is the main file:

```sh
node -r ./preload-me.js app.js
```

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/cli/imgs/cli-4.png" width="1000" />
  <br />
</p>

Preloading modules is useful when using consuming modules that instrument or configure the process in some way. One example would be the dotenv module.

## Stack Trace Limit

Stack traces are generated for any `Error` that occurs, so they're usually the first point of call when debugging a failure scenario. By default, a stack trace will contain the last ten stack frames (function call sites) at the point where the trace occurred. This is often fine, because the part of the stack you are interested in is often the last 3 or 4 call frames. However there are scenarios where seeing more call frames in a stack trace makes sense, like checking that the application flow through various functions is as expected.

The stack trace limit can be modified with the `--stack-trace-limit` flag. This flag is part of the JavaScript runtime engine, V8, and can be found in the output of the `--v8-options` flag.

Consider a program named `app.js` containing the following code:

```sh
function f (n = 99) {
  if (n === 0) throw Error()
  f(n - 1)
}
f()
```

When executed, the function `f` will be called 100 times. On the 100th time, an `Error` is thrown and stack for the error will be output to the console.

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/cli/imgs/cli-5.png" width="1000" />
  <br />
</p>

The stack trace output only shows the call to the f function, in order to see the very first call to f the stack trace limit must be set to 101. This can be achieved with the following:

```sh
node --stack-trace-limit=101 app.js 
```

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/cli/imgs/cli-6.png" width="1000" />
  <br />
</p>

Setting stack trace limit to a number higher than the amount of call frames in the stack guarantees that the entire stack will be output:

```sh
node --stack-trace-limit=99999 app.js
```
<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/cli/imgs/cli-7.png" width="1000" />
  <br />
</p>

Generally, the stack trace limit should stay at the default in production scenarios due to the overhead involved with retaining long stacks. It can nevertheless be useful for development purposes.


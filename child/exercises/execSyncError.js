'use strict'

const { execSync } = require('child_process')

// const result = execSync(`${process.execPath} -e 'console.error("this is the error")'`)
// console.log(result.toString())

// try {
//   const result = execSync(`${process.execPath} -e 'process.exit(1)'`)
// } catch (err) {
//   console.error(err)
// }


try {
  const result = execSync(`${process.execPath} -e 'throw Error("Kbooom")'`)
} catch (err) {
  console.error(err)
}

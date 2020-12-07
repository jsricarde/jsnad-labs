'use strict'

const outPutStats = () => {
    const uptime = process.uptime()
    const { user, system } = process.cpuUsage()
    console.log(uptime, user, system, (user + system)/1000000)
}

outPutStats()

setTimeout(() => {
    outPutStats()
    const now = Date.now()
  // make the CPU do some work:
    while (Date.now() - now < 5000) {}
    outPutStats()
}, 500);
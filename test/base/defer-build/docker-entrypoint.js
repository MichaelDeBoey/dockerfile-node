#!/usr/bin/env node

const { spawn } = require('node:child_process')
const path = require('node:path')
const fs = require('node:fs')

const env = { ...process.env }

;(async() => {
  // If running the web server then migrate existing database
  if (process.argv.slice(-3).join(' ') === 'npm run start') {
    // place Sqlite3 database on volume
    const source = path.resolve('./dev.db')
    const target = '/data/' + path.basename(source)
    if (!fs.existsSync(source) && fs.existsSync('/data')) fs.symlinkSync(target, source)

    // prepare database
    await exec('npx prisma migrate deploy')
    await exec('npm run build')
  }

  // launch application
  await exec(process.argv.slice(2).join(' '))
})()

function exec(command) {
  const child = spawn(command, { shell: true, stdio: 'inherit', env })
  return new Promise((resolve, reject) => {
    child.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} failed rc=${code}`))
      }
    })
  })
}

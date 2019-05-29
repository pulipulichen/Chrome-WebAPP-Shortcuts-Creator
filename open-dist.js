//console.log('@TODO OK')
const exec = require('child_process').exec
const path = require('path')

if (process.platform === 'win32') {
  let distPath = path.join('dist', 'chrome-webapp-shortcuts-creator.exe')
  //console.log(distPath)
  exec(distPath, () => {})
}
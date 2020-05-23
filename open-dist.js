//console.log('@TODO OK')
const exec = require('child_process').exec
const path = require('path')
const DateHelper = require('./app/helpers/DateHelper.js').default
const fs = require('fs')
const os = require('os')
const getLastLine = require('./build-scripts/fileTools.js').getLastLine

// ------------------------------
// 記錄檔案大小 
let distPath
if (process.platform === 'win32') {
  distPath = path.join('dist', 'chrome-webapp-shortcuts-creator.exe')
}
else if (process.platform === 'linux') {
  distPath = path.join('dist', 'chrome-webapp-shortcuts-creator_1.0.0_amd64.deb')
}
let logPath = 'dist/log.txt'
let size = fs.statSync(distPath).size
let timeString = DateHelper.getCurrentTimeString()
let sizeInterval = 0

// 先讀取最後一行
let readLog = () => {
  if (fs.existsSync(logPath) === false) {
    writeLog()
    return false
  }
  
  getLastLine(logPath, 1)
        .then((lastLine) => {
          console.log(lastLine)
          if (lastLine.lastIndexOf('\t') > 0) {
            let lastSize = lastLine.slice(lastLine.indexOf('\t') + 1, lastLine.lastIndexOf('\t')).trim()
            lastSize = parseInt(lastSize, 10)
            sizeInterval = size - lastSize
          }
          
          writeLog()
        })
        .catch((err) => {
          console.error(err)
        })
}

let writeLog = () => {
  let line = timeString + '\t' + size + '\t' + sizeInterval + '\n'

  fs.open(logPath, 'a', 777, function( e, id ) {
    fs.write( id, line, null, 'utf8', function(){
     fs.close(id, function(){
      //console.log('file is updated');
      if (process.platform === 'linux') {
        fs.chmodSync(logPath, 0o777)
      }
      console.log(line)
     });
    });
   });
}

readLog()

if (process.platform === 'win32') {
  
  //console.log(distPath)
  exec(distPath, () => {})
}
else if (process.platform === 'linux') {
  let terminalBinsCandicates = [
    //'/usr/bin/xfce4-terminal',
    '/usr/bin/xterm',
    '/usr/bin/gnome-terminal',
    '/usr/bin/konsole',
    '/usr/bin/terminal'
  ]
  
  let terminalPath
  for (let i = 0; i < terminalBinsCandicates.length; i++) {
    let p = terminalBinsCandicates[i]
    if (fs.existsSync(p)) {
      terminalPath = p
      break
    }
  }
  
  if (terminalPath !== undefined) {
    let command = `${terminalPath} -e sudo dpkg -i ./${distPath} -y`
    exec(command, (error, stdout, stderr) => {
      
      if (error) {
        console.log(error)
      }
      if (stdout) {
        console.log(stdout)
      }
      if (stderr) {
        console.log(stderr)
      }
      
      exec('/opt/chrome-webapp-shortcuts-creator/chrome-webapp-shortcuts-creator', (error, stdout, stderr) => {
        if (error) {
          console.log(error)
        }
        if (stdout) {
          console.log(stdout)
        }
        if (stderr) {
          console.log(stderr)
        }
      })
    })
  }
}
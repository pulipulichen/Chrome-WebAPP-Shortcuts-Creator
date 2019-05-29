//console.log('@TODO OK')
const exec = require('child_process').exec
const path = require('path')
const DateHelper = require('./app/helpers/DateHelper.js').default
const fs = require('fs')
const os = require('os')
const getLastLine = require('./libs/fileTools.js').getLastLine

// ------------------------------
// 記錄檔案大小 
let distPath = path.join('dist', 'chrome-webapp-shortcuts-creator.exe')
let logPath = 'dist/log.txt'
let size = fs.statSync(distPath).size
let timeString = DateHelper.getCurrentTimeString()
let sizeInterval = 0

// 先讀取最後一行
let readLog = () => {
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

  fs.open(logPath, 'a', 666, function( e, id ) {
    fs.write( id, line, null, 'utf8', function(){
     fs.close(id, function(){
      //console.log('file is updated');
      
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
const path = require('path')
const url = require('url')
const fs = require('fs')

const {
  clipboard
} = require('electron')

// ------------

// 取得剪貼簿裡面的檔案
let data = clipboard.readText('clipboard')
//console.log(data)

// ------------------

// 判斷是否是URL
let URLHelper = {
  _pattern: new RegExp('^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[\-\=-a-z\u4e00-\u9eff\\d%_.~+]*)*' + // port and path
          '(\\?[\:;&a-z\u4e00-\u9eff\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\u4e00-\u9eff\\d_]*)?$', 'i'), // fragment locator
  isURL: function (url) {
    if (url.indexOf('#') > -1) {
      url = url.slice(0, url.indexOf('#'))
    } 
    return !!this._pattern.test(url);
  }
}

// For test
//data = "https://github.com/pulipulichen/Chrome-WebAPP-Shortcuts-Creator/issues/30"

if (URLHelper.isURL(data) === false) {
  process.exit()
}

// ------------------
// 讀取Chrome的位置
if (fs.existsSync('./config.json') === false) {
  process.exit()
}

let config = fs.readFileSync('./config.json').toString()
config = JSON.parse(config)
let chromeFilePath = config.chromeFilePath
if (typeof(chromeFilePath) !== 'string') {
  process.exit()
}

//console.log(chromeFilePath)

// ------------------
// 組成指令
// "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --ignore-certificate-errors --app=https://www.facebook.com/pulipuli.chen
//let cmd = `"${chromeFilePath}" --ignore-certificate-errors --app=${data}`

//console.log(cmd)
const spawn  = require('child_process').spawn  
spawn(chromeFilePath
  , ['--ignore-certificate-errors', `--app=${data}`]
  , {detached: true})

// ------------------
// 結束離開

process.exit()
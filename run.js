// electron . --mode development
//console.log(process.platform)

const {exec} = require('child_process')
const fs = require('fs')
const path = require('path')

// -----------------------------

let runElectron = {
  init: function () {
    this.checkSandboxPermission(() => {
      this.run()
    })
  },
  checkSandboxPermission: function (callback) {
    if (process.platform === 'linux') {
      let chromeSandbox = path.resolve('./node_modules/electron/dist/chrome-sandbox')
      //console.log(chromeSandbox)
      let stat = fs.statSync(chromeSandbox)

      let owner = stat.uid
      let mode = stat.mode
      //console.log([owner, mode])

      if (owner !== 0 || mode !== 35309) {
        this.changeSandboxPermission(chromeSandbox, callback)
      } else {
        if (typeof (callback) === 'function') {
          callback()
        }
      }
    }
    else {
      if (typeof (callback) === 'function') {
        callback()
      }
    }
  },
  changeSandboxPermission: function (chromeSandbox, callback) {
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

    console.log("We need to change permission of '" + chromeSandbox + "'")
    let command = terminalPath + ' -e "'
            + ' sudo chown root ' + chromeSandbox + ' '
            + ' && sudo chmod 4755 ' + chromeSandbox + '"'

    //console.log(command)
    this.exec(command, callback)
  },
  run: function () {


// -----------------------------

    let mode = 'production'
    if (process.argv.indexOf('--mode') - process.argv.indexOf('development') === -1) {
      mode = 'development'
    }

    let command = `electron . --mode ${mode}`
    //console.log(command)

    this.exec(command)
  },
  exec: function (command, callback) {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        return;
      }

      // the *entire* stdout and stderr (buffered)
      if (stdout.trim() !== '') {
        console.log(`stdout: ${stdout}`)
      }
      if (stderr.trim() !== '') {
        console.error(`stderr: ${stderr}`)
      }

      if (typeof (callback) === 'function') {
        callback(stdout)
      }
    })
  }
}

runElectron.init()
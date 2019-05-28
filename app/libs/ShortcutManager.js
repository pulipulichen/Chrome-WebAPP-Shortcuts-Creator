let ShortcutManager = {
  create: function (saveToPath, options) {
    //console.log('@TODO createShortcut')
    if (process.platform === 'win32') {
      this.createWin32(saveToPath, options)
    }
    else {
      alert('@TODO createShortcut')
    }
  },
  _filterPathWin32: function (filePath) {
    return filePath.split('/').join('\\\\')
  },
  createWin32: function (saveToPath, options) {
    if (ws === null) {
      ws = require('windows-shortcuts')
    }

    options.target = this._filterPathWin32(options.target)
    //chromeFilePath = chromeFilePath.split("/").join("\\")
    let iconFilePath = options.icon
    options.icon = path.resolve(ElectronHelper.getBasePath(), 'tmp', iconFilePath).split("/").join("\\\\")
    options.desc = options.desc.split('\n').join(' ').trim()
    
    if (exec === null) {
      exec = require('child_process').exec
    }
    
    if (fs.existsSync(saveToPath)) {
      if (process.platform === 'win32') {
        //console.log(saveToPath)
        let commend = `del "${saveToPath}"`
        //console.log(commend)
        exec(commend)
      }
      else {
        fs.unlinkSync(saveToPath)
      }
    }

    ws.create(saveToPath, options, (err) => {
      if (err) {
        alert(err)
        console.error(saveToPath)
        console.error(options)
        throw Error(err)
      }
      
      exec(`"${saveToPath}"`)
      shell.showItemInFolder(saveToPath);
      //if (process.platform === 'win32') {
        //let dirname = path.dirname(saveToPath)
        //exec(`start "" "${dirname}"`)
      //}
      //console.log(e)
    });
  }
}

window.ShortcutManager = ShortcutManager
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

    ws.create(saveToPath, options, (err) => {
      if (err) {
        alert(err)
        console.error(saveToPath)
        console.error(options)
        throw Error(err)
      }
      //console.log(e)
    });
  }
}

window.ShortcutManager = ShortcutManager
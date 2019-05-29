let ShortcutManager = {
  getDefaultPath: function (title) {
    if (process.platform === 'linux') {
      title = title + '.desktop'
      
      let candidatePaths = [
        '/usr/share/applications',
        '~/.local/share/applications'
      ]
      
      let output
      for (let i = 0; i < candidatePaths.length; i++) {
        let p = candidatePaths[i]
        if (fs.existsSync(p)) {
          output = p
          break
        }
      }
      
      return path.join(output, title)
    }
    else {
      if (process.platform === 'win32') {
        title = title + '.lnk'
      }
      return path.join(getPath('desktop'), title)
    }
  },
  create: function (saveToPath, options) {
    //console.log('@TODO createShortcut')
    if (process.platform === 'win32') {
      this.createWin32(saveToPath, options)
    }
    else {
      this.createLinux(saveToPath, options)
    }
  },
  _filterPathWin32: function (filePath) {
    return filePath.split('/').join('\\\\')
  },
  /**
   * Create shortcut for Windows
   * @param {String} saveToPath
   * @param {Object} options = {
        target: this.chromeFilePath,
        args: '--ignore-certificate-errors --app=' + this.url,
        icon: this.icon,
        desc: this.description
      }
   * @returns {ShortcutManager}
   */
  createWin32: function (saveToPath, options) {
    options.target = this._filterPathWin32(options.target)
    //chromeFilePath = chromeFilePath.split("/").join("\\")
    let iconFilePath = options.icon
    options.icon = path.resolve(ElectronHelper.getBasePath(), 'tmp', iconFilePath).split("/").join("\\\\")
    options.desc = options.desc.split('\n').join(' ').trim()
    
    if (fs.existsSync(saveToPath)) {
      //console.log(saveToPath)
      let commend = `del "${saveToPath}"`
      //console.log(commend)
      exec(commend)
    }

    ws.create(saveToPath, options, (err) => {
      if (err) {
        alert(err)
        console.error(saveToPath)
        console.error(options)
        throw Error(err)
      }
      
      exec(`"${saveToPath}"`)
      let dirname = path.dirname(saveToPath)
      exec(`start "" "${dirname}"`)
    });
    
    return this
  },
  /**
   * https://linuxconfig.org/how-to-create-desktop-shortcut-launcher-on-ubuntu-18-04-bionic-beaver-linux
   * @param {type} saveToPath
   * @param {Object} options = {
        target: this.chromeFilePath,
        args: '--ignore-certificate-errors --app=' + this.url,
        icon: this.icon,
        desc: this.description
      }
   * @returns {ShortcutManager}
   */
  createLinux: function (saveToPath, options) {
    let command = `${options.target} ${options.args}`
    let name = path.basename(saveToPath)
    let desc = options.desc
    let icon = options.icon
    
    let template = `#!/usr/bin/env xdg-open
[Desktop Entry]
Version=1.0
Type=Application
Categories=Network
Terminal=false
Exec=${command}
Name=${name}
Comment=${desc}
Icon=${icon}`
    
    // http://javascript.ruanyifeng.com/nodejs/fs.html#toc1
    fs.writeFile(saveToPath, template, (err) => {
      if (err) {
        alert(err)
        throw Error(err)
      }
    })
    
    return this
  }
}

window.ShortcutManager = ShortcutManager
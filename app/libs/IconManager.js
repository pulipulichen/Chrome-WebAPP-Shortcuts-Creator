/* global fs, path */

let IconManager = {
  convertToIco: function (inputFile, callback) {
    //let tmpDir = path.resolve('tmp')
    //let tmpDir = ElectronHelper.getTmpDirPath()
    let filename = path.basename(inputFile)
    filename = filename.slice(0, filename.lastIndexOf('.')) + '.ico'
    //let targetIconPath = path.resolve(tmpDir, filename)
    let targetIconPath = ElectronHelper.getTmpDirPath(filename)

    // ---------------------------------

    if (fs.existsSync(targetIconPath)) {
      console.log('Icon is existed: ' + targetIconPath)
      if (typeof(callback) === 'function') {
        callback(targetIconPath)
      }
      return
    }
    
    //inputFile = '.\\' + path.relative("./", inputFile)
    //targetIconPath = '.\\' + path.relative("./", targetIconPath)
    
    // ---------------------------------

    let convertExe = this._getConvertExePath()
    
    let command = convertExe + ' -background none -gravity center -geometry 256x -extent 256x256 "' + inputFile + '" "' + targetIconPath + '"'
    
    //command = iconv.encode(command, 'Big5').toString()
    //let command = [path.join(path), path.join(targetIconPath)]
    //command = command.split("\\").join('/')
    console.log(command)

    exec(command, (err, stdout, stderr) => {
      console.log(err)
      console.log(stdout)
      console.log(stderr)
      
      if (typeof(callback) === 'function') {
        setTimeout(() => {
          callback(targetIconPath)
        }, 1000)
      }
    })
  },
  _getConvertExePath: function () {
    //let convertExe = path.resolve('convert.exe')
    let convertExe = ElectronHelper.getTmpDirPath('convert.exe')
    if (fs.existsSync(convertExe) === false) {
      // 試著複製檔案過去
      let originalExe = ElectronHelper.resolveAppPath('convert.exe')
      //console.log([originalExe, convertExe])
      if (fs.existsSync(originalExe) === false) {
        let errorMessage = 'convert.exe is not found'
        alert(errorMessage)
        throw Error(errorMessage)
        return 
      }
      fs.copyFileSync(originalExe, convertExe)
      
      //convertExe = path.resolve('app/convert.exe')
    }
    //convertExe = '.\\' + path.relative("./", convertExe)
    /*
    if (fs.existsSync(convertExe) === false) {
      let errorMessage = 'convert.exe is not found'
      alert(errorMessage)
      throw Error(errorMessage)
      return 
    }
    */
    return convertExe
  },
  isInTmpFolder: function (filePath) {
    let tmpDir = ElectronHelper.getTmpDirPath()
    //console.log(tmpDir)
    //console.log([tmpDir, filePath])
    
    return (filePath.startsWith(tmpDir) === true)
  },
  copyToTmpFolder: function (filePath, callback) {
    //let tmpDir = ElectronHelper.getTmpDirPath()
    let filename = path.basename(filePath)
    //let targetPath = path.join(tmpDir, filename)
    let targetPath = ElectronHelper.getTmpDirPath(filename)
    
    // ---------------------------------
    //console.log(targetPath)
    //console.log(fs.existsSync(targetPath))
    //return
    
    if (fs.existsSync(targetPath)) {
      if (typeof(callback) === 'function') {
        callback(targetPath)
      }
      return
    }
    
    // ---------------------------------
    
    fs.copyFile(filePath, targetPath, (err) => {
      if (err) {
        throw err;
      }
      if (typeof(callback) === 'function') {
        callback(targetPath)
      }
    });
  },
  getIconBase64: function (icon, callback) {
    if (typeof(icon) === 'function' && callback === undefined) {
      callback = icon
      icon = undefined
    }
    
    let iconPath = ElectronHelper.getTmpDirPath(icon)
    
    if (fs.existsSync(iconPath) === false || icon === undefined) {
      //iconPath = ElectronHelper.resolveAppPath('imgs/icon.ico')
      console.log(`Icon is not found: ${iconPath}`)
      $.get('imgs/icon.ico.base64.txt', callback)
      return
    }
    
    //console.log(iconPath)
    fs.readFile(iconPath, (err, data) => {
      let base64 = 'data:image/x-icon;base64,' + data.toString('base64')
      //console.log(base64)
      //fs.writeFile(iconPath + '.base64.txt', base64, () => {})
      if (typeof(callback) === 'function') {
        callback(base64)
      }
    })
  },
  writeBase64ToTmpFolder: function (base64, callback) {
    //let tmpDir = ElectronHelper.getTmpDirPath()
    let filename = DateHelper.getCurrentTimeString()
    let targetPath = ElectronHelper.getTmpDirPath(filename + '.png')
    
    // ---------------------------------
    //console.log(targetPath)
    //console.log(fs.existsSync(targetPath))
    //return
    
    if (fs.existsSync(targetPath)) {
      if (typeof(callback) === 'function') {
        callback(targetPath)
      }
      return
    }
    
    // ---------------------------------
    let pos = base64.indexOf(';base64,')
    if (pos > -1 && pos < 100) {
      base64 = base64.slice(pos + 8)
    }
    
    fs.writeFile(targetPath, base64, 'base64', (err) => {
      if (err) {
        throw err;
      }
      if (typeof(callback) === 'function') {
        callback(targetPath)
      }
    });
  },
}

window.IconManager = IconManager
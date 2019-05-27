let IconManager = {
  convertToIco: function (inputFile, callback) {
    let tmpDir = path.resolve('tmp')
    let filename = path.basename(inputFile)
    filename = filename.slice(0, filename.lastIndexOf('.')) + '.ico'
    let targetIconPath = path.resolve(tmpDir, filename)

    let convertExe = path.resolve('convert.exe')
    if (fs.existsSync(convertExe) === false) {
      convertExe = path.resolve('app/convert.exe')
    }
    let command = convertExe + ' -background none -gravity center -geometry 256x -extent 256x256 "' + inputFile + '" "' + targetIconPath + '"'
    //let command = [path.join(path), path.join(targetIconPath)]
    //console.log(command)

    if (exec === null) {
      exec = require('child_process').exec
    }

    exec(command, (err, stdout, stderr) => {
      if (typeof(callback) === 'function') {
        callback(targetIconPath)
      }
    })
  },
  isInTmpFolder: function (filePath) {
    let tmpDir = path.resolve('tmp')
    //console.log(tmpDir)
    return (filePath.startsWith(path.resolve('tmp')) === false)
  },
  copyToTmpFolder: function (filePath, callback) {
    let tmpDir = path.resolve('tmp')
    let filename = path.basename(filePath)
    let targetPath = path.join(tmpDir, filename)
    fs.copyFile(filePath, targetPath, (err) => {
      if (err) {
        throw err;
      }
      if (typeof(callback) === 'function') {
        callback(targetPath)
      }
    });
  },
  getIconBase64: function (filePath, callback) {
    fs.readFile('tmp/' + filePath, (err, data) => {
      let base64 = 'data:image/x-icon;base64,' + data.toString('base64')
      //console.log(base64)
      if (typeof(callback) === 'function') {
        callback(base64)
      }
    })
  }
}

window.IconManager = IconManager
let ChromeHelper = {
  detectFilePath: function () {
    let candidatePath
    if (process.platform === 'win32') {
      candidatePath = [
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
      ]
    }
    
    for (let i = 0; i < candidatePath.length; i++) {
      let path = candidatePath[i]
      if (fs.existsSync(path)) {
        return path
      }
    }
    
    return ''
  }
}

window.ChromeHelper = ChromeHelper
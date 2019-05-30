let ChromeHelper = {
  detectFilePath: function () {
    let candidatePath
    if (process.platform === 'win32') {
      candidatePath = [
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
      ]
    }
    else if (process.platform === 'linux') {
      candidatePath = [
        '/opt/google/chrome/google-chrome'
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
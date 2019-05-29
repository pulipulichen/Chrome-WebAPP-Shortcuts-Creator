PathHelper = {
  hyperCharacters: [':', '/', '|', '▬'],
  removeCharacters: ["ღ", '✿', '◕', '➨', '♥', '♫', '△', '❤', '🔔', '▼'],
  safeFilterTitle: function (title) {
    title = this.safeFilter(title)
    
    if (title.length > 30) {
      title = title.slice(0, 30)
    }
    
    return title.trim()
  },
  safeFilter: function (title) {
    this.hyperCharacters.forEach(char => {
      title = title.split(char).join('-')
    })
    
    this.removeCharacters.forEach(char => {
      title = title.split(char).join('')
    })
    return title.trim()
  },
  cleanFilename: function (filename) {
    let dirname = path.dirname(filename)
    let basename = path.basename(filename)
    let ext = basename.slice(basename.lastIndexOf('.'))
    basename = basename.slice(0, basename.lastIndexOf('.'))
    basename = basename.replace(/[^A-Za-z0-9\s]/g, '')
    while (basename.indexOf('  ') > -1) {
      basename = basename.split('  ').join(' ')
    }
    basename = basename.trim()
    let simplePath = path.join(dirname, basename + ext)
    return simplePath
  }
}

window.PathHelper = PathHelper
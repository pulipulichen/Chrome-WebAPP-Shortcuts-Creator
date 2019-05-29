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
  }
}

window.PathHelper = PathHelper
PathHelper = {
  hyperCharacters: [':', '/', '|'],
  removeCharacters: ["ღ", '✿', '◕', '➨', '♥', '♫', '△'],
  safeFilterTitle: function (title) {
    this.hyperCharacters.forEach(char => {
      title = title.split(char).join('-')
    })
    
    this.removeCharacters.forEach(char => {
      title = title.split(char).join('')
    })
    
    if (title.length > 20) {
      title = title.slice(0, 20)
    }
    
    return title
  }
}

window.PathHelper = PathHelper
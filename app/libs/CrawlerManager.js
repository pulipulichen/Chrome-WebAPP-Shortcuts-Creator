let CrawlerManager = {
  loadFromURL: function (url, callback) {
    let data = {
      title: 'a',
      description: 'b',
      icon: 'icon.ico'
    }
    
    if (typeof(callback) === 'function') {
      callback(data)
    }
  }
}

window.CrawlerManager = CrawlerManager
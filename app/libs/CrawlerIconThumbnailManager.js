let CrawlerIconThumbnailManager = {
  _iconSelectors: [
    {
      selector: 'link[rel="image_src"][href]',
      method: 'attr',
      key: 'href'
    },
    {
      selector: 'link[rel="shortcut icon"][href]',
      method: 'attr',
      key: 'href'
    },
  ],
  match: function (url, $, callback) {
    for (let i = 0; i < this._iconSelectors.length; i++) {
      let conf = this._iconSelectors[i]
      if ($(conf.selector).length > 0) {
        let iconURL = $(conf.selector)[conf.method](conf.key)
        iconURL = CrawlerIconManager.filterBaseURL(iconURL, new URL(url))
        if (typeof(callback) === 'function') {
          callback(iconURL)
        }
        return iconURL
      }
    }
    
    if (typeof(callback) === 'function') {
      callback()
    }
    return
  }
}

window.CrawlerIconThumbnailManager = CrawlerIconThumbnailManager
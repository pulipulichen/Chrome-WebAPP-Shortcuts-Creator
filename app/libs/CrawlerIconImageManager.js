/* global cheerio, CrawlerIconManager, URLHelper */

let CrawlerIconImageManager = {
  _selectMainImageConf: [
    {
      selector: 'article img',
      method: 'attr',
      field: 'data-lazy-src'
    },
    {
      selector: 'article img',
      method: 'attr',
      field: 'src'
    },
    {
      selector: 'header image',
      method: 'attr',
      field: 'src'
    },
    {
      selector: 'body',
      method: 'attr',
      field: 'background'
    },
  ],
  selectMainImage: function (body, url, callback) {
    let urlObject = new URL(url)
    let $ = cheerio.load(body)
    
    for (let i = 0; i < this._selectMainImageConf.length; i++) {
      let conf = this._selectMainImageConf[i]
      if ($(conf.selector).length > 0) {
        let url = $(conf.selector).eq(0)[conf.method](conf.field)
        if (typeof(url) === 'string') {
          url = CrawlerIconManager.filterBaseURL(url, urlObject)
          //console.log(url)
          if (URLHelper.isURL(url)) {
            if (typeof(callback) === 'function') {
              callback(url)
            }
            return url
          }
          
        }
      }
    }
    
    if (typeof(callback) === 'function') {
      callback()
    }
    return
  },
}

window.CrawlerIconImageManager = CrawlerIconImageManager
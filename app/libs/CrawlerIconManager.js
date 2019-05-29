/* global cheerio */

let CrawlerIconManager = {
  parseIcon: function ($, body, url, title, callback) {
    CrawlerIconURLManager.match(url, $, (iconURL) => {
      if (iconURL !== undefined) {
        return this.parseIconPath(iconURL, url, title, callback)
      }
      CrawlerIconThumbnailManager.match(url, $, (iconURL) => {
        if (iconURL !== undefined) {
          return this.parseIconPath(iconURL, url, title, callback)
        }
        CrawlerIconFaviconManager.parseFavicon(body, url, (iconURL) => {
          if (iconURL !== undefined) {
            return this.parseIconPath(iconURL, url, title, callback)
          }
          CrawlerIconImageManager.selectMainImage(body, url, (iconURL) => {
            if (iconURL !== undefined) {
              return this.parseIconPath(iconURL, url, title, callback)
            }
            else if (typeof(callback) === 'function') {
              callback()
            }
          })
        })
      })
    })
  },
  
  filterBaseURL: function (iconURL, urlObject) {
    if (typeof(iconURL) !== 'string') {
      return
    }
    else if (iconURL.startsWith('data:')) {
      return iconURL
    }
    
    if (URLHelper.isURL(iconURL) === false) {
      if (iconURL.startsWith('//')) {
        iconURL = urlObject.protocol + iconURL
      }
      else if (iconURL.startsWith('/')) {
        iconURL = urlObject.protocol + '//' + urlObject.host + iconURL
      }
      else {
        iconURL = urlObject.protocol + '//' + urlObject.host + '/' + urlObject.pathname + '/' + iconURL
      }
      //console.log(iconURL)
    }
    
    if (iconURL.startsWith('http://') === false && iconURL.startsWith('https://') === false) {
      let pathname = urlObject.pathname
      if (pathname.lastIndexOf('/') > 0) {
        pathname = pathname.slice(0, pathname.lastIndexOf('/'))
      }
      iconURL = urlObject.protocol + '//' + urlObject.host + '/' + pathname  + '/' + iconURL
    }
    
    //console.log(iconURL, URLHelper.isURL(iconURL))
    return iconURL
  },
  parseIconPath: function (iconURL, url, title, callback) {
    if (typeof(iconURL) !== 'string') {
      if (typeof(callback) === 'function') {
        callback('icon.ico')
      }
      return
    }
    
    if (iconURL.startsWith('data:')) {
      this._downloadIconFromBase64(iconURL, url, title, (iconPath) => {
        if (iconPath === undefined) {
          iconPath = 'icon.ico'
        }
        
        if (typeof(callback) === 'function') {
          callback(iconPath)
        }
      })
    }
    else {
      iconURL = this._filterBloggerURL(iconURL)

      this._downloadIconFromURL(iconURL, title, (iconPath) => {
        if (iconPath === undefined) {
          iconPath = 'icon.ico'
        }
        
        if (typeof(callback) === 'function') {
          callback(iconPath)
        }
      })
    }
  },
  _filterBloggerURL: function (url) {
    if (typeof(url) !== 'string') {
      return url
    }
    
    // http://3.bp.blogspot.com/-GLqCKzmZlRk/XNw_3HbwlDI/AAAAAAAEPsA/PXlRPS2OiFs1-uCGo2xp4Y18_zPIYHYdQCK4BGAYYCw/s0/1-Webpack_2.png
    // http://3.bp.blogspot.com/-GLqCKzmZlRk/XNw_3HbwlDI/AAAAAAAEPsA/PXlRPS2OiFs1-uCGo2xp4Y18_zPIYHYdQCK4BGAYYCw/s256/1-Webpack_2.png
    
    // http://lh5.ggpht.com/puddingchen.35/SIs83s5vWbI/AAAAAAAADY4/jIjWUjhcbEQ/0704_112314_thumb.jpg?imgmax=800
    // http://lh5.ggpht.com/puddingchen.35/SIs83s5vWbI/AAAAAAAADY4/jIjWUjhcbEQ/0704_112314_thumb.jpg?imgmax=256
    
    // http://lh3.ggpht.com/puddingchen.35/SPHeS5SqyCI/AAAAAAAAE9E/Z950slGSW98/s1600-h/pudding%28500px%29%5B7%5D.gif
    // http://lh3.ggpht.com/puddingchen.35/SPHeS5SqyCI/AAAAAAAAE9E/Z950slGSW98/s256/pudding%28500px%29%5B7%5D.gif
    
    //console.log(url)
    if (url.indexOf('.bp.blogspot.com/') > -1 && url.indexOf('/s0/') > -1) {
      let pos = url.lastIndexOf('/s0/')
      url = url.slice(0, pos) + '/s256/' + url.slice(pos + 4)
    }
    else if (url.indexOf('.ggpht.com/') > -1 && url.indexOf('/s1600-h/') > -1) {
      let pos = url.lastIndexOf('/s1600-h/')
      url = url.slice(0, pos) + '/s256/' + url.slice(pos + 9)
    }
    else if (url.indexOf('.ggpht.com/') > -1 && url.endsWith('?imgmax=800')) {
      url = url.slice(0, url.lastIndexOf('=')) + '=256'
    }
    return url
  },
  _downloadTargetBasepath: function (url, title) {
    let urlObjectIcon = new URL(url)
    let host = urlObjectIcon.host
    if (host.length > 20) {
      host = host.slice(0, 20).trim()
    }
    title = encodeURI(title).split('%').join('')
    if (title.length > 20) {
      title = title.slice(0, 20).trim()
    }
    title = host  + '-' + title
    //let filePath = path.resolve('tmp', title + '.' + ext)
    return ElectronHelper.getTmpDirPath(title)
  },
  _downloadIconFromURL: function (url, title, callback) {
    let ext = url.slice(url.lastIndexOf('.') + 1)
    if (ext.lastIndexOf('?') > -1) {
      ext = ext.slice(0, ext.lastIndexOf('?'))
    }
    
    if (URLHelper.isURL(url) === false) {
      let errorMessage = 'URL is not correct: ' + url
      alert(errorMessage)
      throw Error(errorMessage)
      return
    }
    
    let targetBasepath = this._downloadTargetBasepath(url, title)
    let filePath = targetBasepath + '.' + ext
    let iconPath = targetBasepath + '.ico'
    
    //console.log([filePath, iconPath])
    
    // -----------------------------------
    if (fs.existsSync(iconPath)) {
      if (typeof(callback) === 'function') {
        callback(iconPath)
      }
      return
    }
    else if (process.platform !== 'win32' 
            && fs.existsSync(filePath)) {
      if (typeof(callback) === 'function') {
        callback(filePath)
      }
      return
    }
    
    // -----------------------------------
    let file = fs.createWriteStream(filePath)
    let urlObjectIcon = new URL(url)
    let protocolIcon = urlObjectIcon.protocol

    var getHandlerIcon;
    if (protocolIcon === "http:") {
        getHandlerIcon = http
    }
    else {
        getHandlerIcon = https
    }
    
    getHandlerIcon.get(url, (response) => {
      response.pipe(file)
      
      if (process.platform === 'win32' 
              && ext !== 'ico') {
        IconManager.convertToIco(filePath, (iconPath) => {
          //fs.unlink(filePath, () => {
            //console.log(iconPath)
            if (typeof(callback) === 'function') {
              callback(iconPath)
            }
          //})
        })
      }
      else {
        if (typeof(callback) === 'function') {
          callback(filePath)
        }
      }
    })
  },
  _downloadIconFromBase64: function (base64, url, title, callback) {
    if (typeof(base64) !== 'string' || base64.startsWith('data:') === false) {
      if (typeof(callback) === 'function') {
        callback()
      }
      return
    }
    
    let ext = base64.slice(base64.indexOf('/') + 1, base64.indexOf(';base64,')).trim()
    let targetBasepath = this._downloadTargetBasepath(url, title)
    let filePath = targetBasepath + '.' + ext
    let iconPath = targetBasepath + '.ico'
    
    // --------------------------------
    
    if (fs.existsSync(iconPath)) {
      if (typeof(callback) === 'function') {
        callback(iconPath)
      }
      return
    }
    else if (process.platform !== 'win32' 
            && fs.existsSync(filePath)) {
      if (typeof(callback) === 'function') {
        callback(filePath)
      }
      return
    }
    
    // --------------------------------
    
    fs.writeFile(filePath, base64, 'base64', (err) => {
      if (err) {
        alert(err)
        throw Error(err)
        return
      }
      
      if (process.platform === 'win32') {
        IconManager.convertToIco(filePath, (iconPath) => {
          if (typeof(callback) === 'function') {
            callback(iconPath)
          }
        })
      }
      else {
        if (typeof(callback) === 'function') {
          callback(filePath)
        }
      }
    })
  },
}

window.CrawlerIconManager = CrawlerIconManager
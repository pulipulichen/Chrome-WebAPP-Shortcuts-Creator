/* global cheerio, CrawlerIconURLManager, CrawlerIconThumbnailManager, CrawlerIconFaviconManager, CrawlerIconImageManager, URLHelper, IconManager, fs, encodeURI, http, https, download, path */

let CrawlerIconManager = {
  parseIcon: function ($, body, url, title, callback) {
    CrawlerIconURLManager.match(url, $, (iconURL) => {
      if (iconURL !== undefined) {
        //console.log(iconURL)
        return this.parseIconPath(iconURL, url, title, callback)
      }
      CrawlerIconThumbnailManager.match(url, $, (iconURL) => {
        if (iconURL !== undefined) {
          //console.log(iconURL)
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
      return false
    }
    else if (iconURL.startsWith('data:')) {
      return iconURL
    }
    
    //console.log(iconURL)
    
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
      return false
    }
    
    if (iconURL.startsWith('data:')) {
      //console.log(iconURL)
      this._downloadIconFromBase64(iconURL, url, title, (iconPath) => {
        this.afterDownload(iconPath, callback)
      })
    }
    else if (iconURL.startsWith('predefined-icons/')) {
      //console.log(iconURL)
      this._copyIconFromPredefinedIcons(iconURL, url, title, (iconPath) => {
        this.afterDownload(iconPath, callback)
      })
    }
    else if (iconURL.startsWith('https://drive.google.com/thumbnail?')) {
      //console.log(iconURL)
      this._downloadIconFromGoogleDrive(iconURL, title, (iconPath) => {
        this.afterDownload(iconPath, callback)
      })
    }
    else {
      iconURL = this._filterBloggerURL(iconURL)
      //console.log(iconURL)
      this._downloadIconFromURL(iconURL, title, (iconPath) => {
        this.afterDownload(iconPath, callback)
      })
    }
  },
  afterDownload: function (iconPath, callback) {
    // 檢查檔案大小有沒有異常
    if (this._validFilesize(iconPath) === false) {
      if (typeof(callback) === 'function') {
        callback('icon.ico')
      }
      return false
    }
    
    if (process.platform === 'win32' 
              && iconPath.endsWith('.ico') === false) {
      IconManager.convertToIco(iconPath, (iconPath) => {
        this.afterDownload(iconPath, callback)
      })
      return this
    }
    
    if (iconPath === undefined) {
      iconPath = 'icon.ico'
    }

    if (typeof(callback) === 'function') {
      callback(iconPath)
    }
  },
  _validFilesize: function (iconPath) {
    if (iconPath === undefined) {
      return false
    }
    
    let filesize = 0
    if (iconPath !== undefined) {
      filesize = fs.statSync(iconPath).size
    }
    if (filesize < 100) {
      let errorMessage = 'Icon is too small (' + filesize + '):\n' + path.basename(iconPath)
      alert(errorMessage)
      console.error(errorMessage)
      return false
    }
    else {
      return true
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
    title = title.split(',').join('')
    
    title = title.split('/').join('')
    title = title.split('\\').join('')
    title = title.split(':').join('_')
    
    if (title.endsWith('.')) {
      title = title.slice(0, -1)
    }
    
    if (title.startsWith('www.')) {
      title = title.slice(4)
    }
    
    //let filePath = path.resolve('tmp', title + '.' + ext)
    //console.log(title)
    return ElectronHelper.getTmpDirPath(title)
  },
  _downloadIconFromURL: function (url, title, callback) {
    let ext = url.slice(url.lastIndexOf('.') + 1)
    if (ext.lastIndexOf('?') > -1) {
      ext = ext.slice(0, ext.lastIndexOf('?'))
    }
    if (ext.length > 3) {
      ext = 'png'
    }
    
    //console.trace(url)
    if (URLHelper.isURL(url) === false) {
      let errorMessage = 'URL is not correct: ' + url
      alert(errorMessage)
      throw Error(errorMessage)
      return false
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
      return this
    }
    else if (process.platform !== 'win32' 
            && fs.existsSync(filePath)) {
      if (typeof(callback) === 'function') {
        callback(filePath)
      }
      return this
    }
    
    // -----------------------------------
    let file = fs.createWriteStream(filePath)
    file.on("finish", function() {
      if (typeof(callback) === 'function') {
        callback(filePath)
      }
    })
    
    let urlObjectIcon = new URL(url)
    let protocolIcon = urlObjectIcon.protocol

    let getHandlerIcon
    if (protocolIcon === "http:") {
        getHandlerIcon = http
    }
    else {
        getHandlerIcon = https
    }
    
    let options = {
      hostname: urlObjectIcon.host,
      path: urlObjectIcon.pathname,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }
    
    if (options.path.startsWith('//')) {
      options.path = options.path.slice(1)
    }
    
    getHandlerIcon.get(options, (response) => {
      const { statusCode } = response;
      if (statusCode !== 200) {
        let errorMessage = `Request Failed.\nStatus Code: ${statusCode}\n` + JSON.stringify(options)
        //alert(errorMessage)
        console.error(errorMessage) // 這個不是測試，請不要隨意註解
        //throw Error(errorMessage)
        if (typeof(callback) === 'function') {
          callback()
        }
        return this
      }
  
      response.pipe(file)
    })
  },
  _downloadIconFromGoogleDrive: function (url, title, callback) {
    let ext = 'png'
    
    let targetBasepath = this._downloadTargetBasepath(url, title)
    let filePath = targetBasepath + '.' + ext
    let iconPath = targetBasepath + '.ico'
    
    //console.log([filePath, iconPath])
    
    // -----------------------------------
    if (fs.existsSync(iconPath)) {
      if (typeof(callback) === 'function') {
        callback(iconPath)
      }
      return this
    }
    else if (process.platform !== 'win32' 
            && fs.existsSync(filePath)) {
      if (typeof(callback) === 'function') {
        callback(filePath)
      }
      return this
    }
    
    
    // ------------------------------------------------
    
    const options = {
      url: url,
      dest: filePath                // Save to /path/to/dest/image.jpg
    }
    
    download.image(options)
      .then(({ filename, image }) => {
        //console.log('Saved to', filePath)  // Saved to /path/to/dest/image.jpg
        if (typeof(callback) === 'function') {
          callback(filePath)
        }
      })
      .catch((err) => {
        alert(err)
        console.error(err)
        if (typeof(callback) === 'function') {
          callback()
        }
      })
    return this
    /*
    // -----------------------------------
    let file = fs.createWriteStream(filePath)
    file.on("finish", function() {
      if (typeof(callback) === 'function') {
        callback(filePath)
      }
    })
    

    let urlObjectIcon = new URL(url)
    //let getHandlerIcon = require('follow-redirects').https
    let getHandlerIcon = https
    let options = {
      hostname: urlObjectIcon.host,
      path: urlObjectIcon.pathname + urlObjectIcon.search,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      //encoding: null
      //followAllRedirects: true
    }
    //options.headers = { 'User-Agent': 'Mozilla/5.0' }
    
    
    //console.log(protocolIcon)
    console.log(options)
    
    getHandlerIcon.get(options, (response) => {
      const { statusCode } = response;
      if (statusCode !== 200) {
        let errorMessage = `Request Failed.\nStatus Code: ${statusCode}\n` + JSON.stringify(options)
        //alert(errorMessage)
        console.error(errorMessage) // 這個不是測試，請不要隨意註解
        //throw Error(errorMessage)
        if (typeof(callback) === 'function') {
          callback()
        }
        return
      }
      
      console.log(response)
      if (url.startsWith('https://lh3.googleusercontent.com/') === false) {
        this._downloadIconFromGoogleDrive(response.responseUrl, title, callback)
      }
      else {
        response.pipe(file)
      }
    })
     */
  },
  _downloadIconFromBase64: function (base64, url, title, callback) {
    if (typeof(base64) !== 'string' || base64.startsWith('data:') === false) {
      if (typeof(callback) === 'function') {
        callback()
      }
      return false
    }
    
    let ext = base64.slice(base64.indexOf('/') + 1, base64.indexOf(';base64,')).trim()
    if (ext === 'x-icon') {
      ext = 'ico'
    }
    let targetBasepath = this._downloadTargetBasepath(url, title)
    let filePath = targetBasepath + '.' + ext
    let iconPath = targetBasepath + '.ico'
    
    //console.log([filePath, iconPath])
    
    // --------------------------------
    
    if (fs.existsSync(iconPath)) {
      if (typeof(callback) === 'function') {
        callback(iconPath)
      }
      return this
    }
    else if (process.platform !== 'win32' 
            && fs.existsSync(filePath)) {
      if (typeof(callback) === 'function') {
        callback(filePath)
      }
      return this
    }
    
    // --------------------------------
    
    //console.log(base64)
    
    fs.writeFile(filePath, base64, 'base64', (err) => {
      if (err) {
        alert(err)
        throw Error(err)
        return false
      }
      
      if (typeof(callback) === 'function') {
        //console.log('寫完了', filePath)
        callback(filePath)
      }
    })
  },
  _copyIconFromPredefinedIcons: function (predefinedIconPath, url, title, callback) {
    
    let targetBasepath = this._downloadTargetBasepath(url, title)
    let ext = predefinedIconPath.slice(predefinedIconPath.lastIndexOf('.') + 1)
    let filePath = targetBasepath + '.' + ext
    let iconPath = targetBasepath + '.ico'
    
    predefinedIconPath = path.join('app/imgs/', predefinedIconPath)
    //console.log(predefinedIconPath)
    //if (fs.existsSync(predefinedIconPath) === true) {
    if (true) {
      fs.copyFile(predefinedIconPath, filePath, (err) => {
        if (err) {
          alert(err)
          throw err
        }
        if (typeof(callback) === 'function') {
          callback(filePath)
        }
      }) 
    }
    else {
      alert('Icon file "' + predefinedIconPath + '" is not found.') 
      if (typeof(callback) === 'function') {
        callback()
      }
    }
  }
}

window.CrawlerIconManager = CrawlerIconManager
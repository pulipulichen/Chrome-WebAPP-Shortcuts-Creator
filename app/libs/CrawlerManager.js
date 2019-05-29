/* global URLHelper */

let request = require('request')
let cheerio = require('cheerio')
let parseFavicon = require('parse-favicon').parseFavicon
let http = require('follow-redirects').http
let https = require('follow-redirects').https
let iconv = require('iconv-lite')

let CrawlerManager = {
  loadFromURL: function (url, callback) {
    let data = {}

    let urlObject = new URL(url);

    //console.log(url)
    this._requestBody(url, (body) => {
      body = this._decodeHTML(body)
      
      let $ = cheerio.load(body)
      data.title = this._parseTitle($, urlObject.host)
      data.description = this._parseDescription($, urlObject.host)
      //console.log(data)
      this._parseIcon($, body, url, data.title, (iconPath) => {
        //console.log(iconPath)
        if (typeof(iconPath) === 'string') {
          data.icon = path.basename(iconPath)
        }
        else {
          data.icon = 'icon.ico'
        }
        
        if (typeof (callback) === 'function') {
          callback(data)
        }
      })
        
    })


  },
  _requestBody: function (url, callback) {
    request({ 
      url: url, 
      encoding: null 
   }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        if (typeof (callback) === 'function') {
          callback(body)
        }
      } else {
        alert(error)
        throw Error(error)
      }
    })
  },
  _parseTitle: function ($, defaultValue) {
    let title = $("title").text().trim()
    if ('' === title.trim()) {
      title = defaultValue
    }
    title = PathHelper.safeFilterTitle(title)
    return title
  },
  _parseDescription: function ($, defaultValue) {
    let desc = $('meta[name="description"]').attr('content')
    if (desc === undefined) {
      desc = $("title").text().trim()
      if ('' === desc.trim()) {
        desc = defaultValue
      }
    }
    desc = PathHelper.safeFilter(desc)
    return desc
  },
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
    }
  ],
  _parseIcon: function ($, body, url, title, callback) {
    if (url.startsWith("https://www.youtube.com/") || url.startsWith("https://youtu.be/")) {
      let iconURL = this._parseIconYouTube(url)
      return this._parseIconPath(iconURL, url, title, callback)
    }
    else {
      for (let i = 0; i < this._iconSelectors.length; i++) {
        let conf = this._iconSelectors[i]
        if ($(conf.selector).length > 0) {
          let iconURL = $(conf.selector)[conf.method](conf.key)
          iconURL = this._filterBaseURL(iconURL, new URL(url))
          return this._parseIconPath(iconURL, url, title, callback)
        }
      }
      
      // ----------------------------
      
      return this._parseFavicon(body, url, (iconURL) => {
        //console.log(iconURL)
        this._parseIconPath(iconURL, url, title, callback)
      })
    }
  },
  _filterBaseURL: function (iconURL, urlObject) {
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
  _parseFavicon: function (body, url, callback) {
    let urlObject = new URL(url);
    
    let options = {
      baseURI: urlObject.protocol + '//' + urlObject.host,
      allowUseNetwork: true,
      allowParseImage: true
    }
    
    //console.log(options)
    parseFavicon(body, options).then((icons, error) => {
      //console.log(icons)
      //console.log(error)
      let iconURL
      if (icons.length > 0) {
        iconURL = this._selectLargetIcon(icons, urlObject)
      }
      else {
        iconURL = this._selectMainImage(body, urlObject)
      }
      
      //console.log(iconURL)
      
      if (iconURL === undefined) {
        //console.log(iconURL)
        console.log('Icon is not found in this page: ' + url)
        if (typeof(callback) === 'function') {
          callback()
        }
        return
      }
      
      
      if (URLHelper.isURL(iconURL) === false) {
        if (iconURL.startsWith('//')) {
          iconURL = urlObject.protocol + iconURL
        }
        else if (iconURL.startsWith('/')) {
          iconURL = options.baseURI + iconURL
        }
        //console.log(iconURL)
      }
      
      //console.log(iconURL)
      if (typeof(callback) === 'function') {
        callback(iconURL)
      }
    })
  },
  _selectLargetIcon: function (icons, urlObject) {
    var largestSize = 0;
    var largestPath;

    for (var i = 0; i < icons.length; i++) {
      let size = icons[i].size
      if (size === null) {
        console.log('Icon error')
        console.log(icons[i])
        
        //let errorMessage = 'Icon size error'
        //alert(errorMessage)
        //throw Error(errorMessage)
        //return
        
        continue
      }
      else {
        size = parseInt(size.split('x')[0], 10)
      }
      
      if (size > largestSize) {
        largestPath = icons[i].url
        largestSize = size
      }
    }
    
    if (largestPath === undefined && icons.length > 0) {
      largestPath = icons[0].url
    }

    //console.log(31);
    if (largestPath.startsWith("//")) {
      largestPath = urlObject.protocol + largestPath;
    } else if (largestPath.startsWith("/")) {
      largestPath = urlObject.protocol + "//" + urlObject.host + largestPath;
    } else if (largestPath.startsWith("http") === false) {
      largestPath = urlObject.protocol + "//" + urlObject.host + urlObject.pathdir + largestPath;
    }
    
    return largestPath
  },
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
      selector: 'body',
      method: 'attr',
      field: 'background'
    },
  ],
  _selectMainImage: function (body, urlObject) {
    let $ = cheerio.load(body)
    
    for (let i = 0; i < this._selectMainImageConf.length; i++) {
      let conf = this._selectMainImageConf[i]
      if ($(conf.selector).length > 0) {
        let url = $(conf.selector).eq(0)[conf.method](conf.field)
        if (typeof(url) === 'string') {
          url = this._filterBaseURL(url, urlObject)
          //console.log(url)
          return url
        }
      }
    }
  },
  _parseIconYouTube: function (url) {
    // https://www.youtube.com/watch?v=pRWYi9hEKLY
    // https://img.youtube.com/vi/pRWYi9hEKLY/hqdefault.jpg
    // https://youtu.be/pRWYi9hEKLY
    
    let _v
    if (url.startsWith("https://www.youtube.com/")) {
        _v = URLHelper.getAllUrlParams(url).v
    }
    else {
        _v = url.substring(url.lastIndexOf("/")+1, url.length)
    }
    return "https://img.youtube.com/vi/" + _v + "/default.jpg";
  },
  _parseIconPath: function (iconURL, url, title, callback) {
    if (typeof(iconURL) !== 'string') {
      if (typeof(callback) === 'function') {
        callback()
      }
      return
    }
    
    if (iconURL.startsWith('data:')) {
      this._downloadIconFromBase64(iconURL, url, title, (iconPath) => {
        if (typeof(callback) === 'function') {
          callback(iconPath)
        }
      })
    }
    else {
      iconURL = this._filterBloggerURL(iconURL)

      this._downloadIconFromURL(iconURL, title, (iconPath) => {
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
  _decodeHTML: function (body) {
    if (body.indexOf('content="text/html; charset=big5"') > -1) {
      body = iconv.decode(body, 'BIG5')
    }
    //console.log(body)
    return body
  }
}

window.CrawlerManager = CrawlerManager
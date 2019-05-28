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
      //console.log(body)
      
      let $ = cheerio.load(body)
      data.title = this._parseTitle($, urlObject.host)
      data.description = this._parseDescription($, urlObject.host)
      //console.log(data)
      this._parseIcon($, body, url, data.title, (iconPath) => {
        //console.log(iconPath)
        data.icon = path.basename(iconPath)
        
        if (typeof (callback) === 'function') {
          callback(data)
        }
      })
        
    })


  },
  _requestBody: function (url, callback) {
    request(url, function (error, response, body) {
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
      return this._parseIconPath(iconURL, title, callback)
    }
    else {
      for (let i = 0; i < this._iconSelectors.length; i++) {
        let conf = this._iconSelectors[i]
        if ($(conf.selector).length > 0) {
          let iconURL = $(conf.selector)[conf.method](conf.key)
          iconURL = this._filterBaseURL(iconURL, new URL(url))
          return this._parseIconPath(iconURL, title, callback)
        }
      }
      
      // ----------------------------
      
      return this._parseFavicon(body, url, (iconURL) => {
        //console.log(iconURL)
        this._parseIconPath(iconURL, title, callback)
      })
    }
  },
  _filterBaseURL: function (iconURL, urlObject) {
    if (URLHelper.isURL(iconURL) === false) {
      if (iconURL.startsWith('//')) {
        iconURL = urlObject.protocol + iconURL
      }
      else if (iconURL.startsWith('/')) {
        iconURL = urlObject.protocol + '//' + urlObject.host + iconURL
      }
      //console.log(iconURL)
    }
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
      let iconURL = this._selectLargetIcon(icons, urlObject)
      
      if (URLHelper.isURL(iconURL) === false) {
        if (iconURL.startsWith('//')) {
          iconURL = urlObject.protocol + iconURL
        }
        else if (iconURL.startsWith('/')) {
          iconURL = options.baseURI + iconURL
        }
        console.log(iconURL)
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
      var size = parseInt(icons[i].size.split('x')[0], 10);
      if (size > largestSize) {
        largestPath = icons[i].url;
        largestSize = size;
      }
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
  _parseIconPath: function (iconURL, title, callback) {
    iconURL = this._filterBloggerURL(iconURL)
    
    this._downloadIconFromURL(iconURL, title, (iconPath) => {
      if (typeof(callback) === 'function') {
        callback(iconPath)
      }
    })
  },
  _filterBloggerURL: function (url) {
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
    let filePath = ElectronHelper.getTmpDirPath(title + '.' + ext)
    let iconPath = ElectronHelper.getTmpDirPath(title + '.ico')
    
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
            console.log(iconPath)
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
  }
}

window.CrawlerManager = CrawlerManager
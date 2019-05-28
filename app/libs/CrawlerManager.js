let request = require('request')
let cheerio = require('cheerio')
let parseFavicon = require('parse-favicon').parseFavicon
let http = require('follow-redirects').http
let https = require('follow-redirects').https

let CrawlerManager = {
  loadFromURL: function (url, callback) {
    let data = {
      //title: 'a',
      //description: 'b',
      //icon: 'icon.ico'
    }

    let urlObject = new URL(url);

    this._requestBody(url, (body) => {
      let $ = cheerio.load(body)
      data.title = this._parseTitle($, urlObject.host)
      data.description = this._parseDescription($, urlObject.host)
      
      this._parseIcon(body, url, data.title, (iconPath) => {
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
  _parseIcon: function (body, url, title, callback) {
    if (url.startsWith("https://www.youtube.com/") || url.startsWith("https://youtu.be/")) {
      let iconURL = this._parseIconYouTube(url)
      return this._parseIconPath(iconURL, title, callback)
    }
    else {
      return this._parseFavicon(body, url, title, (iconURL) => {
        this._parseIconPath(iconURL, title, callback)
      })
    }
  },
  _parseFavicon: function (body, url, callback) {
    let urlObject = new URL(url);
    
    let options = {
      baseURI: urlObject.protocol + '//' + urlObject.host,
      allowUseNetwork: true,
      allowParseImage: true
    }
    
    parseFavicon(body, options).then((icons) => {
      let iconURL = this._selectLargetIcon(icons, urlObject)
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
    this._downloadIconFromURL(iconURL, title, (iconPath) => {
      if (typeof(callback) === 'function') {
        callback(iconPath)
      }
    })
  },
  _downloadIconFromURL: function (url, title, callback) {
    let ext = url.slice(url.lastIndexOf('.') + 1)
    
    let urlObjectIcon = new URL(url)
    let host = urlObjectIcon.host
    if (host.length > 20) {
      host = host.slice(0, 20)
    }
    if (title.length > 20) {
      title = title.slice(0, 20)
    }
    title = host  + '-' + title
    //let filePath = path.resolve('tmp', title + '.' + ext)
    let filePath = ElectronHelper.getTmpDirPath(title + '.' + ext)
    let iconPath = ElectronHelper.getTmpDirPath(title + '.ico')
    
    // -----------------------------------
    if (fs.existsSync(iconPath)) {
      if (typeof(callback) === 'function') {
        callback(iconPath)
      }
      return
    }
    else if (fs.existsSync(filePath)) {
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
          fs.unlink(filePath, () => {
            if (typeof(callback) === 'function') {
              callback(iconPath)
            }
          })
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
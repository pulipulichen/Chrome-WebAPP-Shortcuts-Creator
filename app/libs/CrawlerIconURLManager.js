/* global URLHelper */



/**
 * 這是第一層要檢查的規則庫
 * @type type
 */
let CrawlerIconURLManager = {
  conf: [
    {
      match: function (url) {
        // https://youtu.be/ocR3ZFMv-Ko
        // https://www.youtube.com/watch?v=ocR3ZFMv-Ko
        return (url.startsWith("https://www.youtube.com/") && url.indexOf('/watch?v=') > 1 ) || url.startsWith("https://youtu.be/")
      },
      process: function (url, $, callback) {
        return CrawlerIconURLManager.parseIconYouTube(url, callback)
      }
    },
    {
      match: function (url) {
        return url.startsWith("https://www.plurk.com/")
      },
      process: function (url, $, callback) {
        let result = CrawlerIconURLManager.parsePlurk($)
        callback(result)
        return result
      }
    },
    /*
    {
      match: function (url) {
        return url.startsWith("https://docs.google.com/document/")
      },
      process: function (url, $, callback) {
        let result = 'predefined-icons/google-docs.png'
        callback(result)
        return result
      }
    },
    {
      match: function (url) {
        return url.startsWith("https://docs.google.com/spreadsheets/")
      },
      process: function (url, $, callback) {
        let result = 'predefined-icons/google-sheets.png'
        callback(result)
        return result
      }
    },
    {
      match: function (url) {
        return url.startsWith("https://docs.google.com/presentation")
      },
      process: function (url, $, callback) {
        let result = 'predefined-icons/google-slides.png'
        callback(result)
        return result
      }
    }
    */
    {
      match: function (url) {
        return (url.startsWith("https://docs.google.com/document/")
                || url.startsWith("https://docs.google.com/spreadsheets/")
                || url.startsWith("https://docs.google.com/presentation/"))
      },
      process: function (url, $, callback) {
        // https://docs.google.com/presentation/d/1qs1YC8M1PkN74abxkF5Gaplk8tGitzXiXGT6ufVL0fI/edit?usp=sharing
        let fileId = url.slice(url.indexOf('/d/') + 3)
        fileId = fileId.slice(0, fileId.indexOf('/'))
        
        let result = `https://drive.google.com/thumbnail?authuser=0&sz=w256-h256&id=${fileId}`
        callback(result)
        return result
      }
    },
    {
      match: function (url) {
        return (url.startsWith("https://www.wunderlist.com/"))
      },
      process: function (url, $, callback) {
        let result = `predefined-icons/wunderlist.png`
        callback(result)
        return result
      }
    },
    {
      match: function (url) {
        return (url.startsWith("https://calendar.google.com/"))
      },
      process: function (url, $, callback) {
        let result = `predefined-icons/google-calendar.png`
        callback(result)
        return result
      }
    },
    {
      match: function (url) {
        return (url.startsWith("https://contacts.google.com/"))
      },
      process: function (url, $, callback) {
        let result = `predefined-icons/google-contacts.png`
        callback(result)
        return result
      }
    },
  ],
  match: function (url, $, callback) {
    for (let i = 0; i < this.conf.length; i++) {
      let c = this.conf[i]
      if (c.match(url)) {
        return c.process(url, $, callback)
      }
    }
    
    if (typeof(callback) === 'function') {
      callback()
    }
    return
  },
  parseIconYouTube: function (url, callback) {
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
    
    let output = "https://img.youtube.com/vi/" + _v + "/default.jpg"
    if (typeof(callback) === 'function') {
      callback(output)
    }
    return output
  },
  parsePlurk: function ($, callback) {
    let output
    if ($('img[src^="https://avatars.plurk.com/"]').length > 0) {
      output = $('img[src^="https://avatars.plurk.com/"]').attr('src')
    }
    else if ($('img[src^="https://imgs.plurk.com/"]').length > 0) {
      output = $('img[src^="https://imgs.plurk.com/"]').attr('src')
    }
    
    if (typeof(callback) === 'function') {
      callback(output)
    }
    return output
  }
}

window.CrawlerIconURLManager = CrawlerIconURLManager
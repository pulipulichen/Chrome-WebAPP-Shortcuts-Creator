let CrawlerIconFaviconManager = {
  parseFavicon: async function (body, url, callback) {
    let urlObject = new URL(url);

    let options = {
      baseURI: urlObject.protocol + '//' + urlObject.host,
      allowUseNetwork: true,
      allowParseImage: true
    }

    //console.log(options)
    try {
      let icons = await parseFavicon(body, options)
      
      //console.log(icons)
      //console.log(error)
      let iconURL
      if (icons.length > 0) {
        iconURL = this._selectLargetIcon(icons, urlObject)
      }
      //console.log(iconURL)

      if (iconURL === undefined) {
        //console.log(iconURL)
        //console.log('Icon is not found in this page: ' + url)
        if (typeof (callback) === 'function') {
          callback()
        }
        return false
      }

      iconURL = CrawlerIconManager.filterBaseURL(iconURL, urlObject)

      //console.log(iconURL)
      if (typeof (callback) === 'function') {
        callback(iconURL)
      }
    }
    catch (e) {
      if (typeof (callback) === 'function') {
        callback()
      }
      return false
    }
  },
  _selectLargetIcon: function (icons, urlObject) {
    var largestSize = 0;
    var largestPath;

    for (var i = 0; i < icons.length; i++) {
      let size = icons[i].size
      if (size === null) {
        //console.log('Icon error')
        //console.log(icons[i])

        //let errorMessage = 'Icon size error'
        //alert(errorMessage)
        //throw Error(errorMessage)
        //return

        continue
      } else {
        size = parseInt(size.split('x')[0], 10)
      }

      if (size > largestSize) {
        largestPath = icons[i].url
        largestSize = size
      }
    }

    if (largestPath === undefined 
            && icons.length > 0
            && icons[0].size !== null) {
      largestPath = icons[0].url
    }

    //console.log(largestPath)

    //console.log(31);
    if (typeof(largestPath) === 'string') {
      if (largestPath.startsWith("//")) {
        largestPath = urlObject.protocol + largestPath;
      } else if (largestPath.startsWith("/")) {
        largestPath = urlObject.protocol + "//" + urlObject.host + largestPath;
      } else if (largestPath.startsWith("http") === false) {
        largestPath = urlObject.protocol + "//" + urlObject.host + urlObject.pathdir + largestPath;
      }
    }

    return largestPath
  },
}

window.CrawlerIconFaviconManager = CrawlerIconFaviconManager
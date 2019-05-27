let request = require('request')
let cheerio = require('cheerio')

let CrawlerManager = {
  loadFromURL: function (url, callback) {
    let data = {
      //title: 'a',
      //description: 'b',
      //icon: 'icon.ico'
    }

    const urlObject = new URL(url);

    this._requestBody(url, ($) => {
      data.title = this._parseTitle($, urlObject.host)
      data.description = this._parseDescription($, urlObject.host)
      data.icon = 'icon.ico'

      if (typeof (callback) === 'function') {
        callback(data)
      }
    })


  },
  _requestBody: function (url, callback) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(body)
        if (typeof (callback) === 'function') {
          callback($)
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
    desc = desc.trim()
    return desc
  }
}

window.CrawlerManager = CrawlerManager
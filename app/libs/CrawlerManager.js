/* global URLHelper */

let request = require('request')
let cheerio = require('cheerio')
let parseFavicon = require('parse-favicon').parseFavicon
//let http = require('follow-redirects').http
//let https = require('follow-redirects').https
const https = require('https')
let iconv = require('iconv-lite')

let CrawlerManager = {
  loadFromURL: function (url, callback) {
    let data = {}

    let urlObject
    try {
      urlObject = new URL(url)
    } catch (e) {
      console.error(e)
      if (typeof(callback) === 'function') {
        callback()
      }
      return false
    }

    //console.log(url)
    this._requestBody(url, (body) => {
      //console.log(body)
      if (body === undefined) {
        if (typeof(callback) === 'function') {
          callback()
        }
        return false
      }
      
      let bodyStr = body.toString()
      if (bodyStr !== body) {
        body = bodyStr
      }
      body = this._decodeHTML(body)
      //console.log(body)
      
      let $ = cheerio.load(body)
      data.title = this._parseTitle($, urlObject.host)
      data.description = this._parseDescription($, urlObject.host)
      //console.log(data)
      CrawlerIconManager.parseIcon($, body, url, data.title, (iconPath) => {
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
    
    let encoding = null
    
    if (url.startsWith('https://webatm.post.gov.tw/')) {
      encoding = 'binary'
    }
    //url = encodeURI(url)
    //console.log(url)
    request({
      url: url,
      //encoding: 'binary',
      encoding: encoding,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        if (typeof (callback) === 'function') {
          callback(body)
        }
      } else {
        alert(error)
        console.log(error)
        if (typeof(response) === 'object' 
                && typeof(response.statusCode) !== 'undefined') {
          console.log(['statusCode', response.statusCode])
        }
        //console.log(body.toString())
        //$('body').removeClass('loading')
        //console.error(error)
        if (typeof (callback) === 'function') {
          callback()
        }
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
    if (desc.length > 50) {
      desc = desc.slice(0, 50).trim()
    }
    return desc
  },
  _decodeHTML: function (body) {
    //console.log(body)
    if (body.indexOf('content="text/html; charset=big5"') > -1
            || (body.indexOf('CONTENT="text/html; charset=big5"') > -1)) {
      //console.log(body)
      //console.log(iconv.decode(body, 'Big5').toString())
      //console.log(iconv.decode(body, 'UTF8').toString())
      body = iconv.decode(body, 'BIG5').toString()
      //console.log('decode')
    }
    //console.log(body)
    return body.trim()
  }
}

window.CrawlerManager = CrawlerManager
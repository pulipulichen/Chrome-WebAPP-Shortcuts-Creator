var fs = require('fs')
  , ini = require('ini')
  , ws = require('windows-shortcuts')
  , URL = require('url-parse')
  , cheerio = require('cheerio')
  , request = require('request')
  , faviconUrl = require('favicon-url')
  , iconv = require('iconv-lite');

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
var chromeLocation = config.global.googleChromeLocation;
//console.log(config);

var url = "http://blog.pulipuli.info";
//chromeLocation = chromeLocation + " --ignore-certificate-errors --app=" + url;

const urlObject = new URL(url);
var linkName = urlObject.host;

request(url, function (error, response, body)
{
    if (!error && response.statusCode == 200)
    {
        var $ = cheerio.load(body);
        var title = $("title").text().trim();
        //title = iconv.encode(title, 'big5');
        
        faviconUrl(url, {timeout: 2000, minBufferLength: 400, securedOnly: true}, (favicon, dataBufferLength) => {
            // Only favicons served over https.
             console.log(favicon)
            // console.log(dataBufferLength)
            
        })
        
        //title = iconv.decode(new Buffer(title), "utf8");
        //console.log(title);
        if ('' === title.trim()) {
            const urlObject = new URL(url);
            title = urlObject.host;
        }

        var linkPath = "D:/Desktop/" + title + ".lnk";
        //linkPath = iconv.decode(new Buffer(linkPath), "big5");
        //console.log(linkPath);
        ws.create(linkPath, {
            target: chromeLocation,
            args: " --ignore-certificate-errors --app=" + url,
            //icon: '%windir%\\system32\\wucltux.dll',
        });
            
    }
});
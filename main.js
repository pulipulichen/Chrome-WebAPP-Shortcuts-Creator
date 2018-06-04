var fs = require('fs')
  , ini = require('ini')
  , ws = require('windows-shortcuts')
  , URL = require('url-parse');;

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
        var title = $("title").text();
        
        var linkPath = "D:/Desktop/" + title + ".lnk";
        ws.create(linkPath, {
            target: chromeLocation,
            args: " --ignore-certificate-errors --app=" + url,
            //icon: '%windir%\\system32\\wucltux.dll',
        });

    }
});
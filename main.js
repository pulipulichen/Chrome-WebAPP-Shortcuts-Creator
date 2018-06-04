var fs = require('fs')
  , ini = require('ini')
  , ws = require('windows-shortcuts')
  , URL = require('url-parse')
  , cheerio = require('cheerio')
  , request = require('request')
  //, faviconUrl = require('favicon-url')
  , parseFavicon = require('parse-favicon').parseFavicon
  , http = require('http')
  //, gm = require('gm')
  , { exec } = require('child_process');

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
var chromeLocation = config.global.googleChromeLocation;
//console.log(config);

var url = "http://blog.pulipuli.info";
//chromeLocation = chromeLocation + " --ignore-certificate-errors --app=" + url;

const urlObject = new URL(url);
var host = urlObject.host;

request(url, function (error, response, body)
{
    if (!error && response.statusCode == 200)
    {
        var $ = cheerio.load(body);
        var title = $("title").text().trim();
        if ('' === title.trim()) {
            title = host;
        }

        var linkPath = "D:/Desktop/" + title + ".lnk";
        //title = iconv.encode(title, 'big5');
        
        parseFavicon(body, { 
            baseURI: 'https://github.com', 
            allowUseNetwork: true, 
            allowParseImage: true 
        }).then(function (icons) {
            var largestSize = 0;
            var largestPath;
            
            for (var i = 0; i < icons.length; i++) {
                var size  = parseInt(icons[i].size.split('x')[0], 10);
                if (size > largestSize) {
                    largestPath = icons[i].path;
                    largestSize = size;
                }
            }

            console.log(largestPath);

            var ext = largestPath.substring(largestPath.lastIndexOf('.') + 1, largestPath.length);
            var localFilePath = __dirname + '\\ico_tmp\\' + host + '.' + ext;
            var localIconPath = __dirname + '\\ico_tmp\\' + host + '.ico';
            var file = fs.createWriteStream(localFilePath);
            if (largestPath.startsWith("http") === false) {
                largestPath = "http:" + largestPath;
            }

            var request = http.get(largestPath, function (response) {
                response.pipe(file);

                // 接下來要把檔案轉換成icon
                console.log(localFilePath);
                exec('convert.exe "' + localFilePath + '" "' + localIconPath + '"', (err, stdout, stderr) => {
                    ws.create(linkPath, {
                        target: chromeLocation,
                        args: ' --ignore-certificate-errors --app=' + url,
                        icon: localIconPath,
                        //icon: 'D:/Desktop/Box Sync/[SOFTWARE]/[SavedIcons]/[ico]/Apps-Google-Drive-Slides-icon.ico',
                    });
                });
            });

        });
        
            
            
    }
});
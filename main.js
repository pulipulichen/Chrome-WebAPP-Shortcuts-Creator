var fs = require('fs')
        , ini = require('ini')
        , ws = require('windows-shortcuts')
        , URL = require('url-parse')
        , cheerio = require('cheerio')
        , request = require('request')
        //, faviconUrl = require('favicon-url')
        , parseFavicon = require('parse-favicon').parseFavicon
        , http = require('follow-redirects').http
        , https = require('follow-redirects').https
        , iconv = require('iconv-lite')
        //, gm = require('gm')
        , {exec} = require('child_process')
        , process = require('process');

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
var chromeLocation = config.global.googleChromeLocation;
process.chdir(__dirname);
//console.log(config);

var url = "http://blog.pulipuli.info";
//var url = "https://www.youtube.com/watch?v=sqzgl2fE_yE";
//var url = "https://www.npmjs.com/package/url-parse";
//var url = "https://github.com/xhawk18/node-autoit";
//var url = "https://docs.google.com/document/d/1gJWmlbei0hy2qQa_w8MxysZ7WKk17KjnZGsPpLdMagQ/edit?usp=sharing";
//var url = "https://nodejs.org/api/url.html#url_url_hash";
//url = "https://www.youtube.com/watch?v=pRWYi9hEKLY";
//url = "http://www.iconninja.com/";

//chromeLocation = chromeLocation + " --ignore-certificate-errors --app=" + url;

exec('input-box.exe "' + url + '"', { encoding: 'Big5', }, (err, stdout, stderr) => {
    url = iconv.decode(stdout, 'Big5').split("\\").join("/").trim();
    if (url === "") {
        return;
    }
    
    //console.log(url);
    
    
    const urlObject = new URL(url);
    var protocol = urlObject.protocol;
    var host = urlObject.host;
    var pathname = urlObject.pathname;
    var pathdir = pathname.substr(0, pathname.lastIndexOf("/")+1);
    //console.log(pathdir);
    //return;

    request(url, function (error, response, body)
    {
        if (!error && response.statusCode === 200)
        {
            var $ = cheerio.load(body);
            var title = $("title").text().trim();
            if ('' === title.trim()) {
                title = host;
            }
            
            title = title.split(":").join("-");
            title = title.split("/").join("-");
            title = title.split("|").join("-");
            title = title.split("ღ").join("");
            // ღ Kawaii Radio | Happy Music to Study/Relax「24/7」| Kawaii Music LiveStream ☆*:o( ≧o≦ )o:*☆ - YouTube
            title = title.split("✿").join("");
            title = title.split("◕").join("");
            title = title.split("➨").join("");
            title = title.split("♥").join("");
            title = title.split("♫").join("");
            
            // My Top 10 Most Kawaii Songs(✿ ◕‿◕)(♪♫)Anime Moe!~♫| Kawaii Music Mix♫ - YouTube
            if (title.length > 30) {
                //title = title.substr(0, 30) + "...";
                title = title.substr(0, 30);
            }
            //console.log(title);

            exec('file-open-dialog.exe "' + title + '"', { encoding: 'Big5', }, (err, stdout, stderr) => {
                //console.log(iconv.decode(stdout, 'Big5'));
                //console.log(iconv.decode(stdout, 'big5'));
                //console.log(iconv.decode(stdout, 'UTF8'));
               //console.log(iconv.decode(stdout, 'utf8'));
                //console.log(stdout.toString());
                //console.log("AAA");

                linkPath = iconv.decode(stdout, 'Big5').split("\\").join("/").trim();

                if (linkPath === "") {
                    return;
                }

                //linkPath = "D:/Desktop/" + title + ".lnk";
                //title = iconv.encode(title, 'big5');
                //console.log(11);

                parseFavicon(body, {
                    baseURI: protocol + '//' + host,
                    allowUseNetwork: true,
                    allowParseImage: true
                }).then(function (icons) {
                    //console.log(21);
                    //console.log(icons);
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
                        largestPath = protocol + largestPath;
                    }
                    else if (largestPath.startsWith("/")) {
                        largestPath = protocol + "//" + host + largestPath;
                    }
                    else if (largestPath.startsWith("http") === false) {
                        largestPath = protocol + "//" + host + pathdir + largestPath;
                    }
                    
                    // 如果是YouTube，則使用預設的縮圖
                    //console.log(url);
                    if (url.startsWith("https://www.youtube.com/") || url.startsWith("https://youtu.be/")) {
                        largestPath = parseYouTubeThumbnail(url);
                        //console.log(largestPath);
                    }
                    
                    //console.log(largestPath);
                    
                    var ext = largestPath.substring(largestPath.lastIndexOf('.') + 1, largestPath.length);
                    var icon_title = title;
                    localFilePath = __dirname + '\\ico_tmp\\' + icon_title + '.' + ext;
                    localIconPath = __dirname + '\\ico_tmp\\' + icon_title + '.ico';
                    var file = fs.createWriteStream(localFilePath);
                    
                    const urlObjectIcon = new URL(largestPath);
                    var protocolIcon = urlObjectIcon.protocol;
                    
                    //console.log(protocolIcon);
                    
                    var getHandlerIcon;
                    if (protocolIcon === "http:") {
                        getHandlerIcon = http;
                    }
                    else {
                        getHandlerIcon = https;
                    }
                    
                    var request = getHandlerIcon.get(largestPath, function (response) {
                        response.pipe(file);
                        
                        // 接下來要把檔案轉換成icon
                        //console.log(localFilePath);
                        
                        if (ext !== "ico") {
                            //console.log('convert.exe "' + localFilePath + '" "' + localIconPath + '"');
                            exec('convert.exe -background none -gravity center -geometry 256x -extent 256x256 "' + localFilePath + '" "' + localIconPath + '"', (err, stdout, stderr) => {
                                /*
                                console.log(linkPath);
                                console.log({
                                    target: chromeLocation,
                                    args: ' --ignore-certificate-errors --app=' + url,
                                    icon: localIconPath,
                                    //icon: 'D:/Desktop/Box Sync/[SOFTWARE]/[SavedIcons]/[ico]/Apps-Google-Drive-Slides-icon.ico',
                                });
                                */
                                wsCreate();

                                if ('ico' !== ext) {
                                    fs.unlink(localFilePath);
                                }
                            });
                        }
                        else {
                            wsCreate();
                        }
                    });
                });
            });
        }
        else {
            console.log(error);
        }
    });
});

var wsCreate = function () {
    ws.create(linkPath, {
        target: chromeLocation,
        args: '--ignore-certificate-errors --app=' + url,
        icon: localIconPath
                //icon: 'D:/Desktop/Box Sync/[SOFTWARE]/[SavedIcons]/[ico]/Apps-Google-Drive-Slides-icon.ico',
    });

};

var parseYouTubeThumbnail = function (_url) {
    // https://www.youtube.com/watch?v=pRWYi9hEKLY
    // https://img.youtube.com/vi/pRWYi9hEKLY/hqdefault.jpg
    // https://youtu.be/pRWYi9hEKLY
    
    if (_url.startsWith("https://www.youtube.com/")) {
        
        var _v = getAllUrlParams(_url).v;
        return "https://img.youtube.com/vi/" + _v + "/default.jpg";
    }
    else {
        var _v = _url.substring(_url.lastIndexOf("/")+1, _url.length);
        return "https://img.youtube.com/vi/" + _v + "/default.jpg";
    }
};

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      //paramName = paramName.toLowerCase();
      //paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}
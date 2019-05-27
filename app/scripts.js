const settings = require('electron').remote.require('electron-settings');
const mode = settings.get('mode')
const path = require ('path')

const electronApp = require('electron').remote.app;

let basepath = './'
if (typeof(process.env.PORTABLE_EXECUTABLE_DIR) === 'string') {
  basepath = process.env.PORTABLE_EXECUTABLE_DIR
}

/*
var basepath = electronApp.getAppPath();
execPath = path.dirname (electronApp.getPath ('exe'));
console.log(basepath)
*/
console.log(basepath)
console.log(path.join(basepath, 'test.txt'))

var fs = require('fs');
fs.writeFile(path.join(basepath, 'test.txt'), 'Hello content!', function (err) {
  if (err) throw err;
  console.log('Saved!');
});

//console.log(mode)

var app = new Vue({
  el: '#app',
  data: {
    url: 'http://blog.pulipuli.info',
    chromeFilePath: 'C://'
  },
  mounted() {
    
  },
  computed: {
    isReady: function () {
      return URLHelper.isURL(this.url)
    }
  },
  created: function () {
    
  },
  methods: {
    selectChromeFilePath: function () {
      alert('selectChromeFilePath')
    }
  }
})
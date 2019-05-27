const settings = require('electron').remote.require('electron-settings');
const mode = settings.get('mode')
const path = require ('path')

const electronApp = require('electron').remote.app;
var fs = require('fs');
const ipc = require('electron').ipcRenderer

/*
let basepath = './'
if (typeof(process.env.PORTABLE_EXECUTABLE_DIR) === 'string') {
  basepath = process.env.PORTABLE_EXECUTABLE_DIR
}

//console.log(ChromeHelper.detectFilePath())


//console.log(basepath)
//console.log(path.join(basepath, 'test.txt'))

fs.writeFile(path.join(basepath, 'test.txt'), 'Hello content!', function (err) {
  if (err) throw err;
  console.log('Saved!');
});
*/

//console.log(mode)

var app = new Vue({
  el: '#app',
  data: {
    url: 'http://blog.pulipuli.info',
    chromeFilePath: ChromeHelper.detectFilePath(),
    persistAttrs: ['url', 'chromeFilePath']
  },
  mounted() {
    ElectronHelper.mount(this, this.persistAttrs)
  },
  computed: {
    isReady: function () {
      return URLHelper.isURL(this.url)
    }
  },
  created: function () {
    ipc.on('selected-file', this._selectChromeFilePathCallback);
  },
  methods: {
    selectChromeFilePath: function () {
      ipc.send('open-file-dialog-chrome-filepath', this.chromeFilePath)
    },
    _selectChromeFilePathCallback: function (event, path) {
      //alert(path)
      this.persist()
    },
    persist: function () {
      ElectronHelper.persist(this, this.persistAttrs)
    },
    selectIconFile: function () {
      console.log('ok')
    }
  },
})
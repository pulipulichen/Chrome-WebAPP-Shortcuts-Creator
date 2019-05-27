const path = require ('path')
const fs = require('fs');

const electronApp = require('electron').remote.app;
const ipc = require('electron').ipcRenderer
const settings = require('electron').remote.require('electron-settings');
const mode = settings.get('mode')

let ws = null // for module "windows-shortcut"

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
    title: '',
    description: '',
    chromeFilePath: ChromeHelper.detectFilePath(),
    iconFilePath: 'icon.ico',
    persistAttrs: ['url', 'title', 'description', 'chromeFilePath', 'iconFilePath']
  },
  mounted() {
    ElectronHelper.mount(this, this.persistAttrs)
  },
  computed: {
    isReady: function () {
      return URLHelper.isURL(this.url)
    },
    isNotReady: function () {
      return (this.isReady === false)
    },
    imgSrcIconFilePath: function () {
      return '../' + this.iconFilePath
    }
  },
  created: function () {
    ipc.on('selected-file', (event, path) => {
      this._selectChromeFilePathCallback(event, path)
    });
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
      console.log('@TODO selectIconFile')
    },
    loadFromURL: function () {
      let url = this.url
      alert('@TODO loadFromURL')
    },
    createShortcut: function () {
      console.log('@TODO createShortcut')
      if (process.platform === 'win32') {
        if (ws === null) {
          ws = require('windows-shortcuts')
        }
        
        let chromeFilePath = this.chromeFilePath.split("/").join("\\\\")
        //chromeFilePath = chromeFilePath.split("/").join("\\")
        let iconFilePath = this.iconFilePath
        iconFilePath = path.resolve(ElectronHelper.getBasePath(), 'tmp', iconFilePath).split("/").join("\\\\")
        let description = this.description
        
        let options = {
          target: chromeFilePath,
          args: '--ignore-certificate-errors --app=' + this.url,
          //args: '--app=' + this.url,
          icon: iconFilePath,
          desc: description
          //icon: 'D:/Desktop/Box Sync/[SOFTWARE]/[SavedIcons]/[ico]/Apps-Google-Drive-Slides-icon.ico',
        }
        
        let title = this.title
        let shortcutFilePath = path.resolve(ElectronHelper.getBasePath(), title + '.lnk').split("/").join("\\\\")
        console.log(shortcutFilePath)
        console.log(options)
        ws.create(shortcutFilePath, options, (err) => {
          if (err) {
            alert(err)
            throw Error(err)
          }
          //console.log(e)
        });
      }
      else {
        alert('@TODO createShortcut')
      }
    }
  },
})

$(() => {
  //$('.create-shortcut').click()
})
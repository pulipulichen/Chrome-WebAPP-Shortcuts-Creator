const path = require ('path')
const fs = require('fs');

const electronApp = require('electron').remote.app;
const ipc = require('electron').ipcRenderer
const settings = require('electron').remote.require('electron-settings');
const mode = settings.get('mode')

let ws = null // for module "windows-shortcut"
let exec = null
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
    iconBase64: null,
    $body: null,
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
      if (this.iconBase64 === null) {
        return '../tmp/' + this.iconFilePath
      }
      else {
        return this.iconBase64
      }
      
      //let filePath = 'tmp/' + this.iconFilePath
      //let data = fs.readFileSync(filePath);
      //return data.toString('base64')
    }
  },
  created: function () {
    ipc.on('selected-file-chrome', (event, path) => {
      this._selectChromeFilePathCallback(event, path)
    });
    ipc.on('selected-file-icon', (event, path) => {
      this._selectIconFileCallback(event, path)
    });
    
    this.$body = $('body')
  },
  methods: {
    _showLoadingLayer: function () {
      this.$body.addClass('loading')
    },
    _hideLoadingLayer: function () {
      this.$body.removeClass('loading')
    },
    selectChromeFilePath: function () {
      ipc.send('open-file-dialog-chrome', this.chromeFilePath)
    },
    _selectChromeFilePathCallback: function (event, filePath) {
      //alert(path)
      this.chromeFilePath = filePath
      this.persist()
    },
    persist: function () {
      ElectronHelper.persist(this, this.persistAttrs)
    },
    selectIconFile: function () {
      //console.log('@TODO selectIconFile')
      let dir = path.resolve('../tmp', this.iconFilePath)
      if (fs.existsSync(dir) === false) {
        dir = path.resolve('./tmp', this.iconFilePath)
      }
      ipc.send('open-file-dialog-icon', dir)
    },
    _selectIconFileCallback: function (event, filePath) {
      //console.log(path)
      if (process.platform === 'win32' 
              && filePath.endsWith('.ico') === false) {
        this._showLoadingLayer()
        IconManager.convertToIco(filePath, (targetIconPath) => {
          this._hideLoadingLayer()
          this._selectIconFileCallback(event, targetIconPath)
        })
        return
      }
      
      // 如果不在tmp資料夾中，則把它搬到tmp中
      //console.log(filePath)
      
      
      //console.log(tmpDir)
      if (IconManager.isInTmpFolder(filePath)) {
        IconManager.copyToTmpFolder(filePath, (targetPath) => {
          this._selectIconFileCallback(event, targetPath)
        })
        return
      }
      
      //console.log(filePath)
      filePath = path.basename(filePath)
      this.iconFilePath = filePath
      IconManager.getIconBase64(filePath, (base64) => {
        this.iconBase64 = base64
      })
      this.persist()
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
        
        let title = PathHelper.safeFilterTitle(this.title)
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
/* global IconManager, ChromeHelper, URLHelper, CrawlerManager, ShortcutManager */

const path = require ('path')
const fs = require('fs');

const remote = require('electron').remote;
const electronApp = remote.app;
const ipc = require('electron').ipcRenderer
const settings = remote.require('electron-settings');
const mode = settings.get('mode')
const shell = remote.shell
//const homedir = require('os').homedir()

let ws = null // for module "windows-shortcut"
let exec = null

const getPath = require('platform-folders').default
//console.log(getPath('desktop'));

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

let app = new Vue({
  el: '#app',
  data: {
    url: 'http://blog.pulipuli.info',
    title: '',
    description: '',
    chromeFilePath: ChromeHelper.detectFilePath(),
    icon: 'icon.ico',
    iconBase64: null,
    $body: null,
    persistAttrs: ['url', 'title', 'description', 'chromeFilePath', 'icon'],
    _urlChanged: false,
    isNeedLoad: false,
    _enablePersist: false
  },
  watch: {
    icon: function (icon) {
      //console.log(['watch', icon])
      IconManager.getIconBase64(icon, (base64) => {
        //console.log(base64)
        //this.iconBase64 = base64
        this.iconBase64 = `url(${base64})`
      })
    }
  },
  mounted() {
    ElectronHelper.mount(this, this.persistAttrs)
  },
  computed: {
    isURLReady: function () {
      return URLHelper.isURL(this.url)
    },
    isURLNotReady: function () {
      return (this.isURLReady === false)
    },
    isReady: function () {
      return (this.isURLReady === true)
    },
    isNotReady: function () {
      return (this.isReady === false)
    },
    imgSrcIconFilePath: function () {
      if (this.iconBase64 === null) {
        return '../tmp/' + this.icon
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
    ipc.on('selected-file-create', (event, path) => {
      this._createShortcutCallback(event, path)
    });
    
    this.$body = $('body')
    IconManager.getIconBase64((base64) => {
      //console.log(base64)
      //this.iconBase64 = base64
      this.iconBase64 = `url(${base64})`
    })
    this._enablePersist = (mode === 'production')
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
      if (this._enablePersist) {
        ElectronHelper.persist(this, this.persistAttrs)
      }
    },
    selectIconFile: function () {
      //let dir = path.resolve('../tmp', this.icon)
      let dir = ElectronHelper.getTmpDirPath('../tmp', this.icon)
      if (fs.existsSync(dir) === false) {
        //dir = path.resolve('./tmp', this.icon)
        dir = ElectronHelper.getTmpDirPath('./tmp', this.icon)
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
      if (IconManager.isInTmpFolder(filePath) === false) {
        IconManager.copyToTmpFolder(filePath, (targetPath) => {
          this._selectIconFileCallback(event, targetPath)
        })
        return
      }
      
      //console.log(filePath)
      filePath = path.basename(filePath)
      this.icon = filePath
      this.persist()
    },
    onURLChange: function () {
      if (URLHelper.isURL(this.url)) {
        this._urlChanged = true
        this.isNeedLoad = true
        $(this.$refs.loadFromURL).focus()
        this.persist()
      }
    },
    loadFromURL: function (callback) {
      this._urlChanged = false
      let url = this.url
      //console.log(url)
      this._showLoadingLayer()
      CrawlerManager.loadFromURL(url, (data) => {
        ['title', 'description', 'icon'].forEach(field => {
          if (typeof(data[field]) === 'string') {
            this[field] = data[field]
          }
        })
        this.persist()
        this._hideLoadingLayer()
        $(this.$refs.createShortcut).focus()
        
        if (typeof(callback) === 'function') {
          callback()
        }
      })
    },
    createShortcut: function () {
      if (this.title.trim() === '') {
        return this.loadFromURL(() => {
          this.createShortcut()
        })
      }
      
      let title = PathHelper.safeFilterTitle(this.title)
      //let basepath = ElectronHelper.getBasePath()
      //let basepath = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], 'Desktop')
      //let basepath = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
      //console.log(['createShortcut', basepath])
      let basepath = getPath('desktop')
      let shortcutFilePath = path.resolve(basepath, title + '.lnk').split("/").join("\\\\")
      //console.log(['createShortcut', shortcutFilePath])
      ipc.send('open-file-dialog-create', shortcutFilePath)
    },
    _createShortcutCallback: function (event, saveToPath) {
      let options = {
        target: this.chromeFilePath,
        args: '--ignore-certificate-errors --app=' + this.url,
        //args: '--app=' + this.url,
        icon: this.icon,
        desc: this.description
        //icon: 'D:/Desktop/Box Sync/[SOFTWARE]/[SavedIcons]/[ico]/Apps-Google-Drive-Slides-icon.ico',
      }
      ShortcutManager.create(saveToPath, options)
    },
    test: function () {
      setTimeout(() => {
        //$('.create-shortcut').click()
        //$('.load-from-url').click()
        //console.log('aaa')
      }, 1000)

    }
  },
  
})

if (mode === 'development') {
  app.test()
}
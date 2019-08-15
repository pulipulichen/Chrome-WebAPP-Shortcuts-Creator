/* global IconManager, ChromeHelper, URLHelper, CrawlerManager, ShortcutManager */

let appConfig = {
  el: '#app',
  data: {
    url: 'http://blog.pulipuli.info',
    autoRetrieve: true,
    title: '',
    description: '',
    chromeFilePath: ChromeHelper.detectFilePath(),
    icon: 'icon.ico',
    iconBase64: null,
    $body: null,
    persistAttrs: ['url', 'autoRetrieve', 'title', 'description', 'chromeFilePath', 'icon', '_debugDemo', '_debugConsole', '_lastShortcutSaveDir'],
    _urlChanged: false,
    isNeedLoad: false,
    _enablePersist: true,
    _debugDemo: false,
    _debugConsole: false,
    _urlWatchLock: undefined,
    _lastShortcutSaveDir: null
  },
  watch: {
    url: function (newUrl) {
      // "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --ignore-certificate-errors --app=https://webatm.post.gov.tw/postatm/index.jsp?_portal=login
      //console.log(newUrl)
      if (newUrl.indexOf(' --app=') > 10) {
        newUrl = newUrl.slice(newUrl.lastIndexOf(' --app=') + 7)
        this.url = newUrl
      }
      
      //console.log(this._urlWatchLock)
      
      if (this._urlWatchLock === undefined && encodeURI(newUrl) !== newUrl) {
        this._urlWatchLock = true
        setTimeout(() => {
          newUrl = encodeURI(newUrl)
          newUrl = newUrl.split('%25').join('%')
          this.url = newUrl
          setTimeout(() => {
            this._urlWatchLock = undefined
          }, 100)
        }, 100)
      }
      
      //return 'http://blog.pulipuli.info'
      
    },
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
    ElectronHelper.mount(this, this.persistAttrs, () => {
      this._afterMounted()
    })
  },
  computed: {
    isURLReady: function () {
      return URLHelper.isURL(this.url)
    },
    isURLNotReady: function () {
      return (this.isURLReady === false)
    },
    isReady: function () {
      return (this.isURLReady === true 
              && this.chromeFilePath !== "" 
              && fs.existsSync(this.chromeFilePath))
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
    FileDragNDropHelper.init((files) => {
      this.onFileDrop(files)
    })
    FilePasteHelper.init((fileBase64) => {
      this.onFilePaste(fileBase64)
    })
  },
  methods: {
    _afterMounted: function () {
      
      // ---------------------

      if (mode === 'development' && this._debugDemo === false) {
        this.test()
      }
      //console.log(this._debugDemo)
      if (this._debugDemo === true) {
        this.demo()
      }
      if (this._debugConsole === true) {
        remote.getCurrentWindow().openDevTools();
      }
      
      $(this.$refs.checkbox).checkbox()
      this.checkIsNeedLoad()
    },
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
      console.log([this._enablePersist, this._debugDemo])
      if (this._enablePersist && (this._debugDemo === false || this._debugDemo === undefined)) {
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
      if (filePath === undefined) {
        return
      }
      
      if ((filePath.startsWith('http://') || filePath.startsWith('https://'))) {
        console.log(filePath)
        if ((filePath.endsWith('.png') || filePath.endsWith('.ico') || filePath.endsWith('.gif') || filePath.endsWith('.jpeg') || filePath.endsWith('.jpg'))) {
          // 需要下載檔案
          //console.log(this.title)
          CrawlerIconManager._downloadIconFromURL(filePath, this.title, (iconPath) => {
            this._selectIconFileCallback(event, iconPath)
          })
        }
        return
      }
      
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
    checkIsNeedLoad: function () {
      if (URLHelper.isURL(this.url)) {
        this.isNeedLoad = true
        $(this.$refs.loadFromURL).focus()
      }
      else {
        this.isNeedLoad = false
      }
    },
    onURLChange: function () {
      this.checkIsNeedLoad()
      if (URLHelper.isURL(this.url)) {
        this._urlChanged = true
        //console.log(this.autoRetrieve)
        if (this.autoRetrieve === true) {
          this.loadFromURL()
        }
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
      //let basepath = ShortcutManager.getDefaultDir()
      //let shortcutFilePath = path.resolve(basepath, title + '.lnk').split("/").join("\\\\")
      let shortcutFilePath = ShortcutManager.getDefaultPath(title, this._lastShortcutSaveDir)
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
      
      //console.log(options)
      this._lastShortcutSaveDir = path.dirname(saveToPath)
      console.log(this._lastShortcutSaveDir)
      this.persist()
      
      ShortcutManager.create(saveToPath, options)
    },
    onFileDrop: function (dropFiles) {
      let dropFile = dropFiles
      if (Array.isArray(dropFiles) && dropFiles.length > 0) {
        dropFile = dropFiles[0].path
      }
      
      //console.log(file)
      this._selectIconFileCallback(null, dropFile)
    },
    onFilePaste: function (fileBase64) {
      IconManager.writeBase64ToTmpFolder(fileBase64, (filePath) => {
        this._selectIconFileCallback(null, filePath)
      })
    },
    demo: function () {
      //console.log('ok?')
      setTimeout(() => {
        if (URLHelper.isURL(this.url) === false) {
          this.url = 'http://blog.pulipuli.info'
        }
        this.title = ''

        $('.create-shortcut').click()
      }, 1000)
      
    },
    test: function () {
      setTimeout(() => {
        //$('.create-shortcut').click()
        //$('.load-from-url').click()
        console.log('aaa')
      }, 1000)
    }
  },
  
}

let app = new Vue(appConfig)

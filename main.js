const {
  app,
  BrowserWindow,
} = require('electron')

const settings = require('electron-settings');

const path = require('path')
const url = require('url')

app.on('ready', createWindow)

let mode = 'production'
if (process.argv.indexOf('--mode') - process.argv.indexOf('development') === -1) {
  mode = "development"
}

app.on('window-all-closed', () => {
  // darwin = MacOS
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function createWindow() {
  // Create the browser window.
  let optionBrowserWindow = {
    width: 400,
    height: 400,
    maximizable: false,
    icon: './icon.ico',
    webPreferences: {
      nodeIntegration: true
    }
  }
  
  
  win = new BrowserWindow(optionBrowserWindow)
  
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app', 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  
  settings.set('mode', mode);
  if (mode === 'development') {
    win.webContents.openDevTools()
  }
  //win.webContents.executeJavaScript('window.MODE="' + mode + '"');
  
  
  // Open DevTools.
  // win.webContents.openDevTools()

  // When Window Close.
  win.on('closed', () => {
    win = null
  })

}

require('./ipc')
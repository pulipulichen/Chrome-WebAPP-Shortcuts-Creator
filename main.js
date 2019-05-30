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
console.log(mode)
//mode = "development"
//mode = 'production'

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
  let height = 500
  if (mode === 'development') {
    height = 520
  }
  
  if (process.platform === 'linux') {
    height = height - 30
  }
  
  let optionBrowserWindow = {
    width: 400,
    height: height,
    maximizable: false,
    icon: './app/imgs/icon.png',
    webPreferences: {
      nodeIntegration: true
    }
  }
  
  if (process.platform === 'win') {
    optionBrowserWindow.icon = optionBrowserWindow.icon.slice(0, optionBrowserWindow.icon.lastIndexOf('.')) 
            + '.ico'
  }
  
  
  win = new BrowserWindow(optionBrowserWindow)
  
  if (mode === 'production') {
    win.setMenu(null)
    win.setMenuBarVisibility(false)
  }
  
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
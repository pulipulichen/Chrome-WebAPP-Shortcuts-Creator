//listen to an open-file-dialog command and sending back selected information
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog

ipc.on('open-file-dialog-chrome-filepath', function (event, dir) {
  console.log(process.platform)
  
  let options = {
    title: 'Please select Google Chrome location',
    properties: ['openFile']
  }
  
  if (dir !== '') {
    if (process.platform === 'win32') {
      dir = dir.split('/').join('\\')
    }
    options.defaultPath = dir
  }
  
  if (process.platform === 'win32') {
    options.filters = [
      { name: 'Executable File', extensions: ['exe'] }
    ]
  }
  
  console.log(options)
  
  dialog.showOpenDialog(options, function (files) {
    if (files) {
      event.sender.send('selected-file', files)
    }
  })
})
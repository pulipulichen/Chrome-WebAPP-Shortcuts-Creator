//listen to an open-file-dialog command and sending back selected information
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const fs = require('fs')
const path = require('path')

ipc.on('open-file-dialog-chrome', function (event, dir) {
  //console.log(process.platform)
  
  let options = {
    title: 'Please select Google Chrome',
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
  
  //console.log(options)
  
  dialog.showOpenDialog(win, options, function (files) {
    if (files && files[0] !== null) {
      event.sender.send('selected-file-chrome', files[0])
    }
  })
})

ipc.on('open-file-dialog-icon', function (event, dir) {
  let options = {
    title: 'Please select a icon image',
    properties: ['openFile']
  }
  
  if (dir !== '' && files[0] !== null) {
    if (process.platform === 'win32') {
      dir = dir.split('/').join('\\')
    }
    options.defaultPath = dir
  }
  
  if (process.platform === 'win32') {
    options.filters = [
      { name: 'Images', extensions: ['ico', 'png', 'jpg', 'jpeg', 'gif'] }
    ]
  }
  
  //console.log(options)
  
  dialog.showOpenDialog(win, options, function (files) {
    if (files && files[0] !== null) {
      event.sender.send('selected-file-icon', files[0])
    }
  })
})

ipc.on('open-file-dialog-create', function (event, filePath) {
  let options = {
    title: 'Save shortcut to...',
    filters: [
      { name: 'Shortcut', extensions: ['lnk'] }
    ]
  }
  if (filePath !== '') {
    if (process.platform === 'win32') {
      filePath = filePath.split('/').join('\\')
      //filePath = filePath.split('\\').join('/')
    }
    options.defaultPath = filePath
  }
  //console.log(options)
  
  dialog.showSaveDialog(win, options, function (file) {
    if (file) {
      event.sender.send('selected-file-create', file)
    }
  })
})
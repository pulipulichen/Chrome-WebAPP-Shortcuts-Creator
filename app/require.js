
const path = require ('path')
const fs = require('fs');

const remote = require('electron').remote;
const electronApp = remote.app;
const ipc = require('electron').ipcRenderer

const shell = remote.shell
const homedir = require('os').homedir()

let ws = null // for module "windows-shortcut"
if (process.platform === 'win32') {
  ws = require('@pulipuli.chen/windows-shortcuts')
}
let exec = require('child_process').exec

const getPath = require('platform-folders').default
//console.log(getPath('desktop'));

const settings = remote.require('electron-settings');
const mode = settings.get('mode')

const download = require('image-downloader')
//console.log(mode)

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

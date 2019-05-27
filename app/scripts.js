const settings = require('electron').remote.require('electron-settings');
const mode = settings.get('mode')

console.log(mode)
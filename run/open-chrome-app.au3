#pragma compile(Icon, '../app/imgs/Apps-Google-Chrome-App-List-icon.ico')
FileChangeDir(@ScriptDir)
ShellExecute("open-chrome-app.bat", "", "", "", @SW_HIDE)
#pragma compile(Icon, '../app/imgs/Apps-Google-Chrome-App-List-icon.ico')
FileChangeDir(@ScriptDir)
ShellExecute("run.bat", "", "", "", @SW_HIDE)
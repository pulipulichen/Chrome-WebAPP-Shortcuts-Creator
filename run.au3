#pragma compile(Icon, 'app/imgs/icon.ico')
FileChangeDir(@ScriptDir)
ShellExecute("run.bat", "", "", "", @SW_HIDE)
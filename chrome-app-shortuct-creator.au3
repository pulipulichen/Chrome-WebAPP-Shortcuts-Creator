#include <File.au3>
#include <FileConstants.au3>
#include <MsgBoxConstants.au3>
#include <WinAPIFiles.au3>
#pragma compile(Icon, 'icon.ico')

FileChangeDir ( @ScriptDir )
Local $cmd = 'node main.js'
Run(@ComSpec & " /c " & $cmd)
#include <MsgBoxConstants.au3>

Local $url = "http://blog.pulipuli.info"
If $CmdLine[0] > 0 Then
   $url = $CmdLine[1]
EndIf

Local $sAnswer = InputBox("URL", "Please enter the URL you want to create.", $url, "", _
		 400, 130)
ConsoleWrite($sAnswer)
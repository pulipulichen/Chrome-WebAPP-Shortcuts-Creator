#include <FileConstants.au3>
#include <MsgBoxConstants.au3>

; Create a constant variable in Local scope of the message to display in FileOpenDialog.
Local $sMessage = "Hold down Ctrl or Shift to choose multiple files."

Local $filename = "shortcut.lnk"
If $CmdLine[0] > 0 Then
   $filename = $CmdLine[1] & ".lnk"
EndIf

; Display an open dialog to select a list of file(s).
Local $sFileOpenDialog = FileOpenDialog($sMessage, @DesktopDir & "\" , "Shortcut (*.lnk)", 0, $filename)
;MsgBox($MB_SYSTEMMODAL, "", "You chose the following files:" & @CRLF & $sFileOpenDialog)
ConsoleWrite($sFileOpenDialog)
Exit ($sFileOpenDialog)
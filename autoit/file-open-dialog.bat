cd %~dp0
file-open-dialog.exe "test"
for /f %%a in ('file-open-dialog.exe') do set "dow=%%a"
echo %dow%
pause

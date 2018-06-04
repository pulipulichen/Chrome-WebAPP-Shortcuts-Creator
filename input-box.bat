cd %~dp0
for /f %%a in ('input-box.exe') do set "dow=%%a"
echo %dow%
pause

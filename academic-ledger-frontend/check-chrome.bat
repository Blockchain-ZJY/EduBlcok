@echo off
chcp 65001 >nul

echo 🔍 检测Chrome浏览器安装状态
echo ==============================

REM 检测Chrome是否安装
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo ✅ 找到Chrome浏览器: C:\Program Files\Google\Chrome\Application\chrome.exe
    goto :found
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo ✅ 找到Chrome浏览器: C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
    goto :found
)

if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    echo ✅ 找到Chrome浏览器: %LOCALAPPDATA%\Google\Chrome\Application\chrome.exe
    goto :found
)

REM 尝试从注册表获取
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=3*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul') do (
        echo ✅ 找到Chrome浏览器: %%b
        goto :found
    )
)

echo ❌ 未找到Chrome浏览器
echo.
echo 请安装Chrome浏览器：
echo - 访问: https://www.google.com/chrome/
echo - 下载并安装Chrome浏览器
echo.
echo 或者使用其他浏览器手动访问应用地址
goto :end

:found
echo.
echo 🌐 Chrome浏览器检测完成，可以正常启动应用

:end
pause

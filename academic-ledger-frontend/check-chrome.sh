#!/bin/bash

echo "🔍 检测Chrome浏览器安装状态"
echo "=============================="

# 检测Chrome是否安装
if command -v google-chrome &> /dev/null; then
    echo "✅ 找到Chrome浏览器: $(which google-chrome)"
elif command -v google-chrome-stable &> /dev/null; then
    echo "✅ 找到Chrome浏览器: $(which google-chrome-stable)"
elif command -v chromium-browser &> /dev/null; then
    echo "✅ 找到Chromium浏览器: $(which chromium-browser)"
elif [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    echo "✅ 找到Chrome浏览器: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [ -f "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" ]; then
    echo "✅ 找到Chrome浏览器: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
elif [ -f "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" ]; then
    echo "✅ 找到Chrome浏览器: C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
else
    echo "❌ 未找到Chrome浏览器"
    echo ""
    echo "请安装Chrome浏览器："
    echo "- Windows: https://www.google.com/chrome/"
    echo "- macOS: https://www.google.com/chrome/"
    echo "- Linux: sudo apt install google-chrome-stable"
    echo ""
    echo "或者安装Chromium浏览器："
    echo "- Linux: sudo apt install chromium-browser"
    exit 1
fi

echo ""
echo "🌐 Chrome浏览器检测完成，可以正常启动应用"

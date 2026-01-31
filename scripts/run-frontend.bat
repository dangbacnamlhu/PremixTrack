@echo off
chcp 65001 >nul
REM ===== SỬA DÒNG DƯỚI THÀNH ĐƯỜNG DẪN THƯ MỤC BẠN GIẢI NÉN NODE (chứa node.exe) =====
set NODE_DIR=D:\nodejs
REM Ví dụ: set NODE_DIR=C:\Users\TenBan\Downloads\node-v20.10.0-win-x64
REM ================================================================================

set "PATH=%NODE_DIR%;%PATH%"
cd /d "%~dp0..\frontend"

echo [PremixTrack] Frontend - dang chay...
echo.

if not exist "node_modules" (
    echo Lan dau chay: dang cai npm...
    call npm install
    echo.
)

call npm run dev
pause

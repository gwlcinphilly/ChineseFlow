@echo off
echo 🚀 Starting ChineseFlow Frontend...

cd frontend

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    call npm install
)

echo.
echo ✅ Frontend is ready!
echo 🌐 Open: http://localhost:5173
echo.
call npm run dev

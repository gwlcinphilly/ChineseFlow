@echo off
echo 🚀 Starting ChineseFlow Backend...

cd backend

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo 📚 Installing dependencies...
pip install -q -r requirements.txt

REM Create data directory if it doesn't exist
if not exist "data\" mkdir data

REM Start server
echo.
echo ✅ Backend is ready!
echo 📚 API Documentation: http://localhost:8000/docs
echo.
python main.py

@echo off
echo 🚀 Starting ChineseFlow Backend...
echo 🗄️  Using Neon PostgreSQL database

cd backend

REM Set Neon PostgreSQL database URL for all environments
set DATABASE_URL=postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

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
echo 🗄️  Database: Neon PostgreSQL
echo.
python main.py

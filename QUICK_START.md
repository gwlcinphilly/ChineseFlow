# ChineseFlow - Quick Start Guide

## 🚀 Getting Started

### Option 1: Automatic Start (macOS)

The easiest way to start the application:

```bash
./start.sh
```

This will open two terminal windows - one for the backend, one for the frontend.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

### Windows Users

Use the `.bat` files instead:

**Command Prompt 1:**
```cmd
start-backend.bat
```

**Command Prompt 2:**
```cmd
start-frontend.bat
```

## 🌐 Access the Application

Once both servers are running:

- **Frontend (Website):** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## 📖 How to Use

### 1. Read & Practice Tab

This is where the main learning happens:

#### **Start Reading (Speech Recognition)**
1. Click the "🎤 Start Reading" button
2. Your browser will ask for microphone permission - click "Allow"
3. Read the Chinese text aloud
4. Watch as the text highlights in real-time based on what you're saying!
5. Click "Stop Recording" when done

**Important:** Use Chrome or Edge for best speech recognition support. Safari and Firefox have limited support.

#### **Listen (Text-to-Speech)**
1. Click "🔊 Listen to All" to hear the entire article
2. Or hover over any sentence and click "🔊 Listen to this sentence"
3. Words will highlight as they're being spoken
4. Click "⏹️ Stop" to stop playback

#### **Get Word Definitions**
1. Click on any Chinese word
2. A tooltip will pop up showing:
   - The Chinese character(s)
   - Pinyin (romanization)
   - English translation
3. Click anywhere else to close the tooltip

#### **Toggle Display Options**
- ☑️ **Show Pinyin:** Toggle to show/hide pinyin under each sentence
- ☑️ **Show Translation:** Toggle to show/hide English translations

### 2. Quiz Tab

Test your comprehension:

1. Answer multiple-choice questions about the article
2. Questions cover:
   - Translation understanding
   - Pinyin recognition
   - Vocabulary knowledge
3. Get immediate feedback
4. See your final score and retry anytime

### 3. Progress Tab

Track your learning:

- **Sessions:** Number of practice sessions completed
- **Minutes:** Total time spent practicing
- **Sentences Practiced:** Cumulative count
- **Recent Sessions:** View your recent practice history

## 📝 Adding Your Own Article

### Method 1: Edit the JSON file

1. Navigate to `backend/data/article.json`
2. Edit the file with your content:

```json
{
  "title": "Your Article Title",
  "level": "intermediate",
  "sentences": [
    {
      "id": 1,
      "chinese": "Your Chinese sentence here.",
      "pinyin": "nǐ de pīnyīn zhèlǐ.",
      "translation": "Your English translation here.",
      "words": []
    }
  ]
}
```

3. Leave `words: []` empty - the backend will generate it automatically
4. Refresh the webpage

### Method 2: Use the API

Visit http://localhost:8000/docs and use the POST `/api/article` endpoint to update the article programmatically.

## 🔧 Troubleshooting

### Backend won't start

**Error:** `command not found: python3`
- **Solution:** Install Python 3.9+ from https://www.python.org/downloads/

**Error:** `pip install failed`
- **Solution:** Run `pip install --upgrade pip` first

### Frontend won't start

**Error:** `command not found: npm`
- **Solution:** Install Node.js 18+ from https://nodejs.org/

**Error:** `Port 5173 is in use`
- **Solution:** The app will automatically use port 5174 or another available port

### Speech Recognition not working

**Browser not supported:**
- Use Google Chrome or Microsoft Edge (recommended)
- Safari has limited support
- Firefox doesn't support speech recognition yet

**Microphone permission denied:**
- Go to browser settings
- Allow microphone access for localhost
- Refresh the page and try again

**Recognition not accurate:**
- Speak clearly and at a moderate pace
- Ensure you're in a quiet environment
- Check that your microphone is working properly

### API Connection Error

**"Failed to fetch article":**
1. Make sure the backend is running (check Terminal 1)
2. Visit http://localhost:8000/api/article to verify
3. If not running, restart with `./start-backend.sh`

## 🎯 Tips for Best Learning Experience

1. **Practice pronunciation:** Use the speech recognition to check your pronunciation
2. **Listen multiple times:** Use the text-to-speech feature to hear native pronunciation
3. **Learn vocabulary:** Click on unfamiliar words to see their meanings
4. **Test yourself:** Hide pinyin and translations as you get more comfortable
5. **Track progress:** Check your progress tab to stay motivated
6. **Regular practice:** Short daily sessions are more effective than long infrequent ones

## 🔄 Stopping the Application

Press `Ctrl + C` in each terminal window to stop the servers.

## 📚 Next Steps

- Add more articles to practice with
- Try reading faster as you improve
- Challenge yourself to read without looking at pinyin
- Take the quiz multiple times to reinforce learning

## 💡 Optional: Add Translation API

Currently, you need to provide translations manually. To add automatic translation:

### Option 1: DeepL API (Recommended)
- Free tier: 500,000 characters/month
- Sign up: https://www.deepl.com/pro-api
- Add API key to backend

### Option 2: Google Cloud Translation
- $20/month for 500,000 characters
- Sign up: https://cloud.google.com/translate
- Add credentials to backend

### Option 3: OpenAI API
- Pay-per-use, excellent quality
- Sign up: https://platform.openai.com/
- Add API key to backend

Contact me if you need help integrating any of these!

## 🆘 Need Help?

If you encounter any issues:
1. Check the terminal outputs for error messages
2. Review this guide
3. Check the main README.md for more technical details
4. Ensure all prerequisites are installed

Happy learning! 加油! (jiā yóu - keep going!)

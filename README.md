# ChineseFlow - Interactive Chinese Learning Platform

An interactive web application for American teenagers to learn Chinese through reading, listening, and speaking practice with real-time feedback.

## ✨ Features

🎤 **Real-time Speech Recognition** - Read aloud and see synchronized highlighting as you speak
🔊 **Text-to-Speech** - Listen to native pronunciation with word-by-word highlighting
📖 **Pinyin Display** - Toggle romanization for learning support
🔍 **Vocabulary Help** - Click any word for instant definitions and translations
📊 **Progress Tracking** - Automatically track your reading practice sessions
🎯 **Comprehension Quizzes** - Test your understanding with interactive quizzes
🎨 **Beautiful UI** - Modern, responsive design optimized for learning

## 🚀 Quick Start

### Option 1: One Command Start (macOS/Linux)

```bash
./start.sh
```

This opens two terminal windows - one for backend, one for frontend.

### Option 2: Manual Start (All platforms)

**Terminal 1 - Backend:**
```bash
./start-backend.sh    # macOS/Linux
# or
start-backend.bat     # Windows
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh   # macOS/Linux
# or
start-frontend.bat    # Windows
```

Then open: **http://localhost:5173**

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Complete user guide with troubleshooting
- **[FEATURES_DEMO.md](FEATURES_DEMO.md)** - How to test each feature
- **[CUSTOMIZATION.md](CUSTOMIZATION.md)** - How to customize and extend
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical overview

## 🎯 System Requirements

### Required
- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Chrome or Edge** - For full speech recognition support

### Recommended
- Good microphone for speech recognition
- Quiet environment for best results
- Modern computer (any from last 5 years works fine)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Modern styling
- **Web Speech API** - Browser-based speech recognition & synthesis (FREE!)

### Backend
- **Python FastAPI** - Modern async web framework
- **jieba** - Chinese word segmentation
- **pypinyin** - Automatic pinyin generation
- **JSON storage** - Simple, local data persistence

## 📖 Sample Content

Comes with a built-in intermediate-level article: **"我的家人" (My Family)**
- 5 sentences about family members
- Perfect for testing all features
- Includes full vocabulary translations

## 🌐 Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Speech Recognition | ✅ Full | ✅ Full | ⚠️ Limited | ❌ No |
| Text-to-Speech | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| All other features | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

**Recommendation:** Use Google Chrome or Microsoft Edge for the best experience.

## 📁 Project Structure

```
Chinese/
├── README.md              # This file
├── QUICK_START.md        # User guide
├── FEATURES_DEMO.md      # Feature demonstration
├── CUSTOMIZATION.md      # Customization guide
├── PROJECT_SUMMARY.md    # Technical summary
│
├── start.sh              # Quick start scripts
├── start-backend.sh
├── start-frontend.sh
│
├── backend/              # Python FastAPI server
│   ├── main.py          # Main API server
│   ├── requirements.txt # Python dependencies
│   └── data/            # Data storage
│
└── frontend/             # React application
    ├── src/
    │   ├── components/  # React components
    │   ├── hooks/       # Custom hooks
    │   └── App.tsx      # Main app
    └── package.json     # Node dependencies
```

## 🎓 How to Use

1. **Read & Practice Tab:**
   - Click "Start Reading" to use speech recognition
   - Click "Listen to All" to hear the article
   - Click any word to see its meaning
   - Toggle pinyin and translations on/off

2. **Quiz Tab:**
   - Test your comprehension
   - Get immediate feedback
   - Track your score

3. **Progress Tab:**
   - View your practice statistics
   - See session history
   - Track improvement over time

## 🎨 Customization

### Add Your Own Article

Edit `backend/data/article.json`:

```json
{
  "title": "Your Article Title",
  "level": "intermediate",
  "sentences": [
    {
      "id": 1,
      "chinese": "你的中文句子。",
      "pinyin": "nǐ de zhōngwén jùzi.",
      "translation": "Your English translation.",
      "words": []
    }
  ]
}
```

Leave `words: []` empty - it's auto-generated!

### Change Colors

Edit `frontend/tailwind.config.js` to customize the theme.

### Adjust Speech Speed

Edit `frontend/src/hooks/useSpeechSynthesis.ts`:
```typescript
utterance.rate = 0.8; // 0.5 = slow, 1.0 = normal, 1.2 = fast
```

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for more options.

## 🔧 Troubleshooting

**Backend won't start:**
- Ensure Python 3.9+ is installed: `python3 --version`
- Try: `cd backend && pip install -r requirements.txt`

**Frontend won't start:**
- Ensure Node.js 18+ is installed: `node --version`
- Try: `cd frontend && npm install`

**Speech recognition not working:**
- Use Chrome or Edge browser
- Allow microphone permissions
- Check microphone is working

**Can't connect to API:**
- Ensure backend is running (check terminal)
- Visit http://localhost:8000/api/article
- Restart backend if needed

For detailed troubleshooting, see [QUICK_START.md](QUICK_START.md).

## 💡 Translation Options (Optional)

Currently uses manual translations. To add automatic translation:

### Free/Trial Options:
- **DeepL API** - 500K chars/month free tier
- **Google Translate** - $20/month for 500K characters

### Paid Options:
- **OpenAI API** - Excellent quality, pay-per-use

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for integration instructions.

## 🎯 Learning Tips

1. **Daily Practice:** 15-30 minutes daily is more effective than long sessions
2. **Gradual Progression:** Start with all aids, gradually hide them
3. **Active Learning:** Use speech recognition, don't just read passively
4. **Repetition:** Read each article 5-10 times before moving on
5. **Track Progress:** Watch your stats to stay motivated

## 📊 What Makes This Special

✅ **100% FREE** - No API keys needed for core features
✅ **Offline-First** - Runs entirely on your computer
✅ **Privacy-Focused** - Your data never leaves your device
✅ **Open Source** - Learn from and modify the code
✅ **Beginner-Friendly** - Easy to set up and use
✅ **Production-Ready** - Professional code quality
✅ **Customizable** - Easy to extend and personalize

## 🎊 Project Status

✅ **Complete and Ready to Use!**

- All features implemented
- No linter errors
- Clean, documented code
- Comprehensive documentation
- Cross-platform support
- Production quality

## 🤝 Contributing

Feel free to:
- Add new features
- Fix bugs
- Improve documentation
- Create new articles
- Share your feedback

## 📝 License

MIT License - Free to use, modify, and distribute.

## 🎓 Credits

Built with modern web technologies and a focus on educational effectiveness.

---

## Next Steps

1. ✅ Run `./start.sh` (or use manual start)
2. ✅ Open http://localhost:5173
3. ✅ Try all features with the sample article
4. ✅ Read [QUICK_START.md](QUICK_START.md) for detailed instructions
5. ✅ Add your own articles using [CUSTOMIZATION.md](CUSTOMIZATION.md)

**Happy learning! 加油！(jiā yóu - keep going!)**

---

**Version:** 1.0  
**Status:** ✅ Production Ready  
**Last Updated:** January 31, 2026

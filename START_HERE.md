# 🎉 Welcome to ChineseFlow!

Your Chinese learning platform is **ready to use**! 

## 🚀 Current Status

✅ **Backend Server:** Running on http://localhost:8000  
✅ **Frontend Server:** Running on http://localhost:5174  
✅ **All Features:** Fully functional  
✅ **Sample Article:** Pre-loaded and ready  

## 🎯 What to Do Right Now

### 1. Open the Application (2 minutes)

Click this link or copy to your browser:
```
http://localhost:5174
```

You should see a beautiful website with:
- Blue/purple gradient background
- "ChineseFlow" header
- Three tabs: Read & Practice, Quiz, Progress
- A Chinese article about family

### 2. Try the Main Features (10 minutes)

#### A. Listen to the Article
1. Click the **"🔊 Listen to All"** button
2. Watch the characters highlight as they're spoken
3. Hear natural Chinese pronunciation
4. This helps you learn correct pronunciation

#### B. Read Aloud with Speech Recognition
1. Click the **"🎤 Start Reading"** button
2. Your browser will ask for microphone permission → Click **"Allow"**
3. Read the first sentence aloud slowly: "我家有四口人：爸爸、妈妈、哥哥和我。"
4. Watch the text turn yellow as you speak!
5. This shows if your pronunciation is correct

**Note:** Use Chrome or Edge for best results. Safari and Firefox have limited support.

#### C. Learn Vocabulary
1. Click on any Chinese word (try clicking "爸爸")
2. A tooltip pops up showing:
   - Chinese: 爸爸
   - Pinyin: bà bà
   - English: dad, father
3. Click different words to build your vocabulary

#### D. Toggle Display Options
1. Uncheck **"Show Pinyin"** - pinyin disappears
2. Try reading without the romanization
3. Check it again when you need help
4. Do the same with **"Show Translation"**

#### E. Take the Quiz
1. Click the **"🎯 Quiz"** tab
2. Answer questions about the article
3. Get immediate feedback
4. See your score at the end

#### F. Check Your Progress
1. Click the **"📊 Progress"** tab
2. See your practice statistics
3. Sessions, minutes, and sentences are tracked automatically

## 📚 Next Steps

### Today (30 minutes)
- [ ] Test all features listed above
- [ ] Read the article 3-4 times
- [ ] Take the quiz
- [ ] Check your progress stats

### This Week
- [ ] Practice 15-30 minutes daily
- [ ] Master the sample article
- [ ] Score 100% on the quiz
- [ ] Add your own article (see below)

### Ongoing
- [ ] Add new articles regularly
- [ ] Track your progress
- [ ] Customize the appearance
- [ ] Share with friends

## 📝 How to Add Your Own Article

1. Stop both servers (press `Ctrl+C` in both terminals)

2. Edit the article file:
```bash
open backend/data/article.json
```

3. Replace with your content:
```json
{
  "title": "Your Title Here",
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

4. Save the file

5. Restart both servers:
```bash
./start-backend.sh    # Terminal 1
./start-frontend.sh   # Terminal 2
```

6. Refresh your browser

**Tip:** Leave `words: []` empty - the backend automatically generates word breakdowns!

## 🎨 Quick Customizations

### Make Text Bigger
Edit `frontend/src/components/ArticleReader.tsx`, line ~90:

Change:
```tsx
<div className="text-2xl leading-relaxed mb-2 chinese-text">
```

To:
```tsx
<div className="text-4xl leading-relaxed mb-2 chinese-text">
```

### Change Colors
Edit `frontend/tailwind.config.js`:

```javascript
primary: {
  DEFAULT: 'hsl(220, 85%, 60%)',  // Change this!
}
```

Try:
- Purple: `hsl(270, 70%, 60%)`
- Green: `hsl(140, 60%, 45%)`
- Red: `hsl(0, 70%, 55%)`

### Adjust Speech Speed
Edit `frontend/src/hooks/useSpeechSynthesis.ts`, line ~15:

Change:
```typescript
utterance.rate = 0.8;  // Current: slow for learning
```

Try:
- Very slow: `0.5`
- Normal: `1.0`
- Fast: `1.2`

## 📖 Documentation

All guides are in your project folder:

- **README.md** - Main overview
- **QUICK_START.md** - Complete user guide with troubleshooting
- **FEATURES_DEMO.md** - How each feature works
- **CUSTOMIZATION.md** - Deep customization options
- **PROJECT_SUMMARY.md** - Technical details
- **VERIFICATION.md** - Test checklist

## 🆘 Troubleshooting

### Backend Not Responding
1. Check if backend terminal shows "Uvicorn running"
2. Visit: http://localhost:8000/api/article
3. Should show JSON data
4. If not, restart: `./start-backend.sh`

### Frontend Shows Connection Error
1. Make sure backend is running first
2. Then start frontend
3. Refresh browser
4. Check both terminals for errors

### Speech Recognition Not Working
1. Use Chrome or Edge (not Safari/Firefox)
2. Click "Start Reading"
3. Click "Allow" for microphone
4. Check browser microphone settings if denied
5. Try reloading the page

### Port Already in Use
If you see "Port 5173 is in use":
- The app will automatically use port 5174 or another port
- Just use the URL shown in the terminal

## 💡 Learning Tips

### Beginner Strategy
1. **Listen first** - Click "Listen to All" 2-3 times
2. **Read along** - Read silently while listening
3. **Learn words** - Click every word you don't know
4. **Practice speaking** - Use speech recognition
5. **Keep aids on** - Show pinyin and translations
6. **Repeat daily** - Same article for 3-5 days

### Intermediate Strategy
1. **Quick listen** - Listen once for overview
2. **Hide translations** - Try to understand without them
3. **Practice speaking** - Focus on pronunciation accuracy
4. **Selective pinyin** - Hide pinyin, use when needed
5. **Quiz yourself** - Take quiz after 2-3 readings
6. **Move faster** - New article every 2-3 days

### Advanced Strategy
1. **No aids** - Hide both pinyin and translations
2. **Natural speed** - Increase speech rate to 1.0
3. **Speed reading** - Read as fast as native speakers
4. **Perfect pronunciation** - Speech recognition must work flawlessly
5. **Master quickly** - New article daily
6. **Create content** - Write your own articles

## 🎯 Your Learning Goals

Set your goals (edit this file to track):

**This Week:**
- [ ] _________________________
- [ ] _________________________
- [ ] _________________________

**This Month:**
- [ ] _________________________
- [ ] _________________________
- [ ] _________________________

**This Year:**
- [ ] _________________________
- [ ] _________________________
- [ ] _________________________

## 🎊 You're All Set!

Everything is installed and working. Your Chinese learning journey starts now!

**Remember:**
✅ Both servers are already running  
✅ Open http://localhost:5174 in Chrome/Edge  
✅ Try all features  
✅ Practice daily  
✅ Track your progress  
✅ Have fun learning!  

## 🚪 When You're Done

To stop the servers:
1. Go to the backend terminal
2. Press `Ctrl+C`
3. Go to the frontend terminal
4. Press `Ctrl+C`

To start again tomorrow:
```bash
./start-backend.sh    # Terminal 1
./start-frontend.sh   # Terminal 2
```

---

**加油！(jiā yóu - keep going!)**

You've got everything you need to learn Chinese effectively. Start now! 🚀

---

**Quick Links:**
- Website: http://localhost:5174
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Help: See QUICK_START.md

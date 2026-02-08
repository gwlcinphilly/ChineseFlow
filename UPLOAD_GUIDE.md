# 📝 Article Upload Guide

## How to Upload Your Own Chinese Article

The ChineseFlow app now includes an **Upload** feature that lets you easily add your own Chinese articles!

## 🚀 Quick Start

1. **Open the app:** http://localhost:5176
2. **Click the "📝 Upload" tab** in the navigation
3. **Fill in the form:**
   - Article title (e.g., "My School Day")
   - Difficulty level (Beginner/Intermediate/Advanced)
   - Add sentences with Chinese text and English translations
4. **Click "Upload Article"**
5. **Done!** The app will automatically:
   - Generate pinyin for each sentence
   - Segment words with definitions
   - Switch to the Read tab to show your article

## 📋 Two Ways to Add Content

### Method 1: Paste from Clipboard (Fastest!)

1. Copy your Chinese sentences to clipboard (from a document, website, etc.)
2. Click **"📋 Paste Chinese Text from Clipboard"**
3. The Chinese text will be automatically inserted
4. Add English translations for each sentence
5. Upload!

**Example:** Copy this text:
```
我今天去了图书馆。
图书馆里有很多书。
我借了三本书。
```

### Method 2: Type Manually

1. Type Chinese text in the "Chinese Text" field
2. Type English translation in the "English Translation" field
3. Click **"+ Add Sentence"** for more sentences
4. Upload!

## ✨ Features

### Automatic Processing

The system automatically:
- ✅ Generates pinyin (romanization) for all Chinese text
- ✅ Segments Chinese into individual words
- ✅ Validates that you have at least one complete sentence
- ✅ Saves your article for immediate use

### Smart Input

- 📝 Multi-line text support (paste paragraphs at once)
- 🗑️ Remove unwanted sentences
- ➕ Add unlimited sentences
- 📋 Clipboard paste for quick entry

## 📖 Example Article Format

Here's a complete example you can try:

**Title:** 去超市
**Level:** Intermediate

**Sentence 1:**
- Chinese: 今天我和妈妈去超市买东西。
- Translation: Today, my mom and I went to the supermarket to buy things.

**Sentence 2:**
- Chinese: 超市里有很多人。
- Translation: There were many people in the supermarket.

**Sentence 3:**
- Chinese: 我们买了水果、蔬菜和牛奶。
- Translation: We bought fruits, vegetables, and milk.

**Sentence 4:**
- Chinese: 妈妈还买了一些零食。
- Translation: Mom also bought some snacks.

**Sentence 5:**
- Chinese: 我帮妈妈拎了很重的购物袋。
- Translation: I helped mom carry the heavy shopping bags.

## 💡 Tips for Best Results

### Content Tips
1. **Keep sentences moderate length** (10-30 characters works best)
2. **Use complete sentences** with proper punctuation
3. **Match difficulty to level:**
   - Beginner: Simple vocabulary, short sentences
   - Intermediate: More complex structures, compound sentences
   - Advanced: Idioms, advanced vocabulary, complex grammar

### Translation Tips
1. **Be accurate but natural** - translate the meaning, not word-for-word
2. **Use proper English grammar**
3. **Include context** when needed

### Technical Tips
1. **Chinese characters only** - Traditional or Simplified both work
2. **Include punctuation** (。！？，etc.)
3. **One sentence per entry** - don't combine multiple sentences

## 🔄 What Happens After Upload

1. **Processing:** Backend generates pinyin and word segmentation
2. **Saves:** Your article replaces the current one
3. **Redirects:** Automatically switches to Read tab
4. **Ready!** All features work immediately:
   - Speech recognition
   - Text-to-speech
   - Word definitions
   - Quiz generation
   - Progress tracking

## 📁 Where is it Saved?

Your article is saved in:
```
backend/data/article.json
```

You can:
- ✅ Edit it manually if needed
- ✅ Back it up
- ✅ Share it with others
- ✅ Upload a new one anytime (replaces current)

## ⚠️ Important Notes

### Current Limitations
- **One article at a time** - uploading replaces the current article
- **No article library** - future feature to save multiple articles
- **Basic word definitions** - uses built-in dictionary (can be enhanced)

### Future Enhancements
- 📚 Article library (save multiple articles)
- 🔍 Word definition API integration
- 📤 Export articles
- 📥 Import from files (.txt, .docx)
- 🤝 Share articles with others

## 🎓 Suggested Article Topics

### Beginner Level
- My Family
- My Daily Routine  
- My Favorite Food
- My Pet
- Weather Today

### Intermediate Level
- My School Day
- A Trip to the Store
- My Hobbies
- Weekend Activities
- My Hometown

### Advanced Level
- Chinese Culture and Traditions
- Career Goals
- Environmental Issues
- Technology and Society
- Literature Review

## 🆘 Troubleshooting

### Upload button doesn't work
- **Check:** Make sure you filled in title, at least one sentence with both Chinese and English
- **Check:** Backend server is running (should see "Running on http://0.0.0.0:8000")

### Pinyin not generated correctly
- **Reason:** Automatic generation may have errors with rare characters
- **Solution:** You can edit `backend/data/article.json` manually to fix pinyin

### Words not segmented properly
- **Reason:** Word segmentation (jieba) sometimes makes mistakes
- **Solution:** Can be manually edited in the JSON file

### "Failed to upload" error
- **Check:** Backend is running
- **Check:** Browser console for errors (F12)
- **Try:** Refresh page and try again

## 🎉 Example Workflow

Here's a complete workflow:

1. **Find content** - Find a Chinese text online or write your own
2. **Copy text** - Copy 3-5 sentences
3. **Open Upload tab** - Click "📝 Upload" in the app
4. **Paste** - Click "Paste from Clipboard"
5. **Add translations** - Type English for each sentence
6. **Set level** - Choose appropriate difficulty
7. **Upload** - Click "Upload Article"
8. **Practice!** - Start learning immediately

## 📚 Where to Find Chinese Content

### For Beginners
- ChinesePod (free lessons)
- HelloChinese app
- Chinese children's stories
- Simple news websites (like "The Chairman's Bao")

### For Intermediate
- Short stories (短篇小说)
- News articles (simplified)
- Blog posts
- Social media posts

### For Advanced
- Literature excerpts
- News articles (full)
- Academic papers
- Classical Chinese texts (with modern translation)

## 🚀 Ready to Try?

1. Open http://localhost:5176
2. Click "📝 Upload"
3. Try the example article above
4. Or create your own!

Happy learning! 加油！

---

**Pro Tip:** Create a collection of articles at different difficulty levels and practice progressively harder content as you improve!

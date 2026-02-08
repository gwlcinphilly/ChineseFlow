# ChineseFlow - Customization Guide

## 📄 Adding Custom Articles

### Understanding Article Structure

Each article consists of:
- **Title:** The article's name
- **Level:** Difficulty (beginner, intermediate, advanced)
- **Sentences:** Array of sentence objects

Each sentence has:
- **id:** Unique number
- **chinese:** The Chinese text
- **pinyin:** Romanization with tone marks
- **translation:** English translation
- **words:** Auto-generated word breakdown

### Creating Your Article

#### Step 1: Prepare Your Content

Write your Chinese article in separate sentences. For example:

```
我喜欢学习中文。
中文是一门很有趣的语言。
我每天都练习说中文。
```

#### Step 2: Add Pinyin

You can use online tools to generate pinyin:
- https://www.pinyinput.com/
- https://www.purpleculture.net/pinyin-converter/
- https://www.chineseconverter.com/pinyin-converter

Or let the backend generate it automatically!

#### Step 3: Translate to English

Provide English translations for each sentence.

#### Step 4: Create the JSON

Edit `backend/data/article.json`:

```json
{
  "title": "Learning Chinese",
  "level": "intermediate",
  "sentences": [
    {
      "id": 1,
      "chinese": "我喜欢学习中文。",
      "pinyin": "wǒ xǐhuan xuéxí zhōngwén.",
      "translation": "I like learning Chinese.",
      "words": []
    },
    {
      "id": 2,
      "chinese": "中文是一门很有趣的语言。",
      "pinyin": "zhōngwén shì yī mén hěn yǒuqù de yǔyán.",
      "translation": "Chinese is a very interesting language.",
      "words": []
    },
    {
      "id": 3,
      "chinese": "我每天都练习说中文。",
      "pinyin": "wǒ měitiān dōu liànxí shuō zhōngwén.",
      "translation": "I practice speaking Chinese every day.",
      "words": []
    }
  ]
}
```

**Important:** Leave `words: []` empty - the backend will automatically:
- Segment the Chinese text into words
- Generate pinyin for each word
- Attach word translations if available

#### Step 5: Add Vocabulary Translations (Optional)

To provide word-level translations, edit `backend/main.py` and add to the `word_translations` dictionary in the `create_sample_article()` function:

```python
word_translations = {
    "我": "I, me",
    "喜欢": "like, love",
    "学习": "study, learn",
    "中文": "Chinese language",
    # Add more translations here
}
```

Then restart the backend server.

## 🎨 Customizing the UI

### Changing Colors

Edit `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'hsl(220, 85%, 60%)', // Change this for main color
        hover: 'hsl(220, 85%, 55%)',
        light: 'hsl(220, 85%, 95%)',
      }
    },
  },
}
```

Color suggestions:
- **Blue theme (current):** `hsl(220, 85%, 60%)`
- **Purple theme:** `hsl(270, 70%, 60%)`
- **Green theme:** `hsl(140, 60%, 45%)`
- **Red/Chinese theme:** `hsl(0, 70%, 55%)`

### Changing Fonts

Edit `frontend/src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;500;600;700&display=swap');
```

Update the font family in `tailwind.config.js`:

```javascript
fontFamily: {
  sans: ['YourFont', 'system-ui', 'sans-serif'],
  chinese: ['Noto Sans SC', 'Source Han Sans', 'sans-serif'],
}
```

### Adjusting Text Size

For larger text (better for learning), edit `frontend/src/components/ArticleReader.tsx`:

Change:
```tsx
<div className="text-2xl leading-relaxed mb-2 chinese-text">
```

To:
```tsx
<div className="text-3xl leading-relaxed mb-2 chinese-text">
```

Or even `text-4xl` for very large text.

## 🔊 Speech Settings

### Adjusting Speech Rate

Edit `frontend/src/hooks/useSpeechSynthesis.ts`:

```typescript
utterance.rate = 0.8; // Current: 0.8 (slower for learning)
```

Options:
- `0.5` - Very slow (good for beginners)
- `0.8` - Slow (current, good for intermediate)
- `1.0` - Normal speed
- `1.2` - Fast

### Changing Voice

Add voice selection in `useSpeechSynthesis.ts`:

```typescript
const speak = useCallback((text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  
  // Get available Chinese voices
  const voices = window.speechSynthesis.getVoices();
  const chineseVoices = voices.filter(voice => voice.lang.includes('zh'));
  
  // Use first Chinese voice if available
  if (chineseVoices.length > 0) {
    utterance.voice = chineseVoices[0];
  }
  
  // ... rest of code
}, []);
```

## 📊 Quiz Customization

### Adding More Questions

Edit `frontend/src/components/Quiz.tsx` in the `generateQuestions()` function.

Current question types:
1. Translation recognition
2. Pinyin recognition
3. Word meaning

You can add:
- Sentence completion
- Character recognition
- Tone practice
- Grammar questions

### Adjusting Quiz Difficulty

Change the number of questions by modifying which questions are generated and returned.

## 🎯 Level Customization

### For Beginners
1. Use shorter sentences (5-10 characters)
2. Add more vocabulary translations
3. Slower speech rate (0.5-0.6)
4. Always show pinyin
5. Larger text size

### For Advanced Learners
1. Longer, more complex sentences
2. Less vocabulary hints
3. Normal speech rate (1.0)
4. Hide pinyin by default
5. Add idioms and 成语 (chéngyǔ)

## 🔌 Adding Translation API

### DeepL Integration

1. Sign up at https://www.deepl.com/pro-api
2. Get your API key
3. Install the Python library:

```bash
cd backend
source venv/bin/activate
pip install deepl
```

4. Update `backend/main.py`:

```python
import deepl

# Add at the top
DEEPL_API_KEY = "your-api-key-here"
translator = deepl.Translator(DEEPL_API_KEY)

# Add a new endpoint
@app.post("/api/translate")
async def translate_text(text: str):
    result = translator.translate_text(text, target_lang="EN-US")
    return {"translation": result.text}
```

### Google Translate Integration

```bash
pip install google-cloud-translate
```

Then update the backend similarly with Google Cloud credentials.

## 🌍 Adding More Languages

To support other languages (Japanese, Korean, etc.):

1. Update speech recognition language in `useSpeechRecognition.ts`:
```typescript
recognition.lang = 'ja-JP'; // Japanese
recognition.lang = 'ko-KR'; // Korean
```

2. Update text-to-speech in `useSpeechSynthesis.ts`
3. Update the word segmentation library in the backend
4. Add appropriate fonts

## 📱 Mobile Optimization

The app is already mobile-responsive, but for better mobile experience:

1. Increase button sizes in `frontend/src/index.css`:
```css
.btn {
  @apply px-8 py-4 text-lg rounded-lg; /* Larger for mobile */
}
```

2. Adjust breakpoints in `tailwind.config.js`

## 🚀 Performance Optimization

### For Large Articles

If you have very long articles (50+ sentences):

1. Implement pagination
2. Load sentences on-demand
3. Cache API responses

### For Faster Loading

1. Pre-generate all word segmentations
2. Use CDN for fonts
3. Optimize images if you add any

## 💾 Database Upgrade

Currently using JSON files. To upgrade to a real database:

### SQLite (Simple)

```bash
cd backend
pip install sqlalchemy
```

Create database models and migrate data.

### PostgreSQL (Production)

For production deployment:

```bash
pip install psycopg2-binary sqlalchemy
```

Update connection strings and deploy to cloud services like:
- Heroku
- Railway
- Render
- DigitalOcean

## 🎓 Educational Features

### Add More Features:

1. **Flashcards:** Create a flashcard mode for vocabulary
2. **Writing Practice:** Add character stroke order
3. **Tone Practice:** Visual tone markers and audio comparison
4. **Dictation Mode:** Listen and type what you hear
5. **Speed Reading:** Gradually increase reading speed
6. **Character Recognition:** Draw characters to identify them

## 🎨 Theme Switcher

To add dark mode:

1. Update `tailwind.config.js`:
```javascript
darkMode: 'class',
```

2. Add dark mode colors
3. Create a theme toggle button
4. Store preference in localStorage

## 📈 Analytics

To track learning progress:

1. Add more detailed statistics
2. Create charts using Chart.js or Recharts
3. Track accuracy, speed, vocabulary size
4. Set goals and milestones

## 🔐 User Accounts (Advanced)

To add multi-user support:

1. Install authentication library
2. Add user database tables
3. Implement login/signup
4. Associate progress with users
5. Add article collections per user

This requires more backend work but enables:
- Multiple learners on one computer
- Cloud sync
- Social features
- Leaderboards

## 📝 Content Management System

Create an admin interface to:
- Add articles through a web form
- Edit existing articles
- Manage vocabulary lists
- Create custom quizzes
- Import articles from files

## 🤝 Contributing

Feel free to:
- Add new features
- Fix bugs
- Improve UI/UX
- Add more articles
- Translate the interface

This is your learning tool - make it work best for you!

---

Need help implementing any of these customizations? Let me know!

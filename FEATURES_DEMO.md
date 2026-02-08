# ChineseFlow - Features Demo Guide

## 🎬 How to Test Each Feature

### 1. Speech Recognition (Real-time Highlighting)

**What it does:** As you read aloud, the text highlights to show what you've said.

**How to test:**
1. Open http://localhost:5173 in Chrome or Edge
2. Click "🎤 Start Reading"
3. Allow microphone access when prompted
4. Read the first sentence slowly and clearly: "我家有四口人：爸爸、妈妈、哥哥和我。"
5. Watch as the characters turn yellow as you speak
6. Try reading faster or slower to see the highlighting adjust

**Tips:**
- Speak clearly and pronounce tones correctly
- Use a quiet environment
- If it's not working, check microphone settings

---

### 2. Text-to-Speech (Listen Mode)

**What it does:** The app reads the article aloud with synchronized highlighting.

**How to test:**
1. Click "🔊 Listen to All" button
2. Watch as each character highlights as it's spoken
3. Notice the natural Chinese pronunciation
4. Click "⏹️ Stop" to pause
5. Try hovering over a single sentence and clicking "🔊 Listen to this sentence"

**Tips:**
- Listen multiple times to learn pronunciation
- Try to read along silently
- Compare your pronunciation with the audio

---

### 3. Word Definitions (Interactive Tooltips)

**What it does:** Click any word to see its meaning and pinyin.

**How to test:**
1. Click on the word "爸爸" (bàba)
2. A tooltip appears showing:
   - Chinese: 爸爸
   - Pinyin: bà bà
   - Translation: dad, father
3. Click anywhere else to close
4. Try clicking other words: 妈妈, 哥哥, 医生, 老师
5. Notice how the tooltip follows your cursor

**Tips:**
- Use this to build vocabulary
- Click unfamiliar words while reading
- The translations help with context

---

### 4. Pinyin Toggle

**What it does:** Show or hide the romanization (pinyin) of Chinese characters.

**How to test:**
1. Find the "Show Pinyin" checkbox (top right of reading area)
2. Uncheck it - pinyin disappears
3. Try reading without pinyin support
4. Check it again when you need help
5. This simulates real Chinese text

**Tips:**
- Start with pinyin visible
- Gradually hide it as you improve
- Use it to check pronunciation

---

### 5. Translation Toggle

**What it does:** Show or hide English translations.

**How to test:**
1. Find the "Show Translation" checkbox
2. Uncheck it - English disappears
3. Try to understand from Chinese only
4. Check it to verify your understanding
5. Great for testing comprehension

**Tips:**
- Read Chinese first, then check translation
- Hide translations to challenge yourself
- Use for self-testing before quizzes

---

### 6. Progress Tracking

**What it does:** Automatically tracks your practice sessions.

**How to test:**
1. Practice for a few minutes (read, listen, etc.)
2. Click the "📊 Progress" tab
3. See your stats:
   - Number of sessions
   - Total minutes practiced
   - Sentences practiced
4. Practice more and come back to see updates
5. View recent session history

**Tips:**
- Check progress daily for motivation
- Set daily/weekly goals
- Watch your stats grow over time

---

### 7. Comprehension Quiz

**What it does:** Tests your understanding of the article.

**How to test:**
1. Read the article first
2. Click the "🎯 Quiz" tab
3. Answer the multiple-choice questions:
   - Translation questions
   - Pinyin recognition
   - Vocabulary meaning
4. Get immediate feedback (green = correct, red = wrong)
5. See your final score
6. Click "Try Again" to retake

**Tips:**
- Take quiz after reading 2-3 times
- Use it to identify weak areas
- Retake until you get 100%

---

## 🎯 Complete Learning Flow

### Session 1: First Read (15 minutes)
1. ✅ Keep pinyin and translations visible
2. ✅ Click "Listen to All" - listen 2 times
3. ✅ Click words you don't know
4. ✅ Read along silently with audio
5. ✅ Try reading aloud with speech recognition

### Session 2: Practice (20 minutes)
1. ✅ Hide translations, keep pinyin
2. ✅ Read each sentence aloud with speech recognition
3. ✅ Listen to sentences that are difficult
4. ✅ Click words to review meanings
5. ✅ Read through 3-4 times

### Session 3: Test (15 minutes)
1. ✅ Hide both pinyin and translations
2. ✅ Read without any aids
3. ✅ Use speech recognition to check pronunciation
4. ✅ Take the comprehension quiz
5. ✅ Review mistakes

### Session 4: Master (10 minutes)
1. ✅ Read at natural speed
2. ✅ Aim for 100% on quiz
3. ✅ Focus on fluency
4. ✅ Move to next article

---

## 🧪 Testing Scenarios

### Scenario A: Pronunciation Practice
**Goal:** Improve speaking accuracy

1. Start speech recognition
2. Read one sentence at a time slowly
3. Watch highlighting to see if recognized correctly
4. If not highlighting correctly, adjust pronunciation
5. Listen to audio to hear correct pronunciation
6. Try again until highlighting matches your reading

### Scenario B: Reading Comprehension
**Goal:** Understand without aids

1. Hide pinyin and translation
2. Read the Chinese text only
3. Try to understand from context
4. Reveal translation to check
5. Note words you didn't know
6. Click those words to learn them

### Scenario C: Vocabulary Building
**Goal:** Learn new words

1. Read through once with translations
2. Click every word you don't know
3. Write down new vocabulary
4. Practice those words specifically
5. Return after a day to review
6. Check if you remember meanings

### Scenario D: Listening Practice
**Goal:** Improve listening comprehension

1. Close your eyes or look away
2. Click "Listen to All"
3. Try to understand without seeing text
4. Look at text to verify
5. Repeat 3-4 times
6. Try to type what you hear (advanced)

---

## 📸 Visual Guide

### Main Interface
```
┌─────────────────────────────────────────┐
│ 📖 ChineseFlow                          │
│    Learn Chinese Through Reading        │
└─────────────────────────────────────────┘

┌───────────────────────────────────────┐
│ 📖 Read & Practice | 🎯 Quiz | 📊 Progress │
└───────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🎤 Start Reading  🔊 Listen to All      │
│ ☑️ Show Pinyin    ☑️ Show Translation    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         我的家人                         │
│                                          │
│ 我家有四口人：爸爸、妈妈、哥哥和我。    │
│ wǒ jiā yǒu sì kǒu rén: bàba, māma...   │
│ There are four people in my family...   │
│ 🔊 Listen to this sentence              │
│                                          │
│ [More sentences...]                      │
└─────────────────────────────────────────┘
```

### Word Tooltip
```
  ┌──────────────┐
  │   爸爸       │
  │   bà bà      │
  │ ─────────    │
  │ dad, father  │
  └──────────────┘
      ↑
  [clicked word]
```

### Progress Display
```
┌─────────────────────────────────┐
│ 📊 Your Progress                │
│                                  │
│ ┌──────┐  ┌──────┐             │
│ │  3   │  │ 45   │             │
│ │Sessions│ │ Min  │             │
│ └──────┘  └──────┘             │
│                                  │
│ ┌──────────────┐                │
│ │    15        │                │
│ │ Sentences    │                │
│ └──────────────┘                │
└─────────────────────────────────┘
```

---

## 🎊 Success Metrics

Track your improvement:

### Week 1
- [ ] Read article with all aids
- [ ] Understand all vocabulary
- [ ] Can pronounce most words correctly
- [ ] Pass quiz with 60%+

### Week 2
- [ ] Read without translations
- [ ] Recognize characters quickly
- [ ] Natural pronunciation
- [ ] Pass quiz with 80%+

### Week 3
- [ ] Read without pinyin
- [ ] Fluent reading speed
- [ ] Perfect pronunciation
- [ ] Pass quiz with 100%

### Week 4
- [ ] Master article completely
- [ ] Read at natural speed
- [ ] Can recite from memory
- [ ] Move to next article

---

## 💪 Challenge Yourself

### Beginner Challenge
- Read the article 10 times in one week
- Learn all vocabulary words
- Score 100% on quiz 3 times in a row

### Intermediate Challenge
- Read without pinyin from day 1
- Only use translation to verify
- Complete in 5 total practice sessions

### Advanced Challenge
- Read without any aids
- Speed read (1 minute or less)
- Perfect pronunciation on first try with speech recognition

---

## 🎓 Pro Tips

1. **Consistency > Intensity:** 15 minutes daily is better than 2 hours once a week
2. **Active Learning:** Use speech recognition actively, not just passive reading
3. **Spaced Repetition:** Review articles after 1 day, 3 days, 1 week
4. **Context Learning:** Focus on understanding sentences, not just words
5. **Natural Speed:** Don't slow down audio too much - aim for natural rhythm
6. **Progress Tracking:** Check your stats to stay motivated
7. **Multiple Articles:** Add variety to maintain interest

---

## 🚀 Start Now!

1. Open http://localhost:5173
2. Read this guide while testing
3. Try each feature one by one
4. Create your learning routine
5. Track your progress
6. Enjoy learning Chinese!

加油！🎉

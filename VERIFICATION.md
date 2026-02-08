# ChineseFlow - Verification Checklist

Use this checklist to verify that everything is working correctly.

## ✅ Installation Verification

### Backend Installation

- [ ] Python 3.9+ installed
  ```bash
  python3 --version
  # Should show: Python 3.9.x or higher
  ```

- [ ] Virtual environment created
  ```bash
  ls backend/venv
  # Should show: bin/ lib/ etc.
  ```

- [ ] Dependencies installed
  ```bash
  cd backend && source venv/bin/activate && pip list
  # Should show: fastapi, uvicorn, pypinyin, jieba
  ```

- [ ] Backend starts successfully
  ```bash
  ./start-backend.sh
  # Should show: "Uvicorn running on http://0.0.0.0:8000"
  ```

- [ ] API responds
  ```bash
  curl http://localhost:8000/api/article
  # Should return JSON data
  ```

### Frontend Installation

- [ ] Node.js 18+ installed
  ```bash
  node --version
  # Should show: v18.x.x or higher
  ```

- [ ] Dependencies installed
  ```bash
  ls frontend/node_modules
  # Should show many folders
  ```

- [ ] Frontend starts successfully
  ```bash
  ./start-frontend.sh
  # Should show: "Local: http://localhost:5173/"
  ```

- [ ] Frontend loads in browser
  ```
  Visit: http://localhost:5173
  # Should show ChineseFlow website
  ```

## ✅ Feature Verification

### 1. Basic Display

- [ ] Website loads without errors
- [ ] Header shows "ChineseFlow"
- [ ] Three tabs visible: Read & Practice, Quiz, Progress
- [ ] Article title displays: "我的家人"
- [ ] Chinese text is visible and readable
- [ ] Pinyin displays correctly below Chinese text
- [ ] English translations display correctly

### 2. Speech Recognition

- [ ] "Start Reading" button is visible
- [ ] Click button prompts for microphone permission
- [ ] After allowing, button changes to "Stop Recording"
- [ ] A pulsing dot appears when recording
- [ ] Speaking Chinese highlights text in yellow
- [ ] "You said:" box shows recognized text
- [ ] Clicking "Stop Recording" stops recognition

**Test Phrase:** Say "我家" slowly and clearly
- Expected: Characters "我家" should highlight

### 3. Text-to-Speech

- [ ] "Listen to All" button is visible
- [ ] Clicking button starts audio playback
- [ ] Characters highlight as they're spoken
- [ ] Audio sounds like native Chinese
- [ ] Button changes to "Stop" during playback
- [ ] Clicking "Stop" stops playback
- [ ] Hovering over sentence shows "Listen to this sentence"
- [ ] Clicking sentence-level button plays only that sentence

### 4. Word Tooltips

- [ ] Hovering over words shows cursor change
- [ ] Clicking a word shows tooltip
- [ ] Tooltip shows:
  - [ ] Chinese characters
  - [ ] Pinyin with tones
  - [ ] English translation
- [ ] Clicking elsewhere closes tooltip
- [ ] Tooltip appears above the word
- [ ] Multiple words can be clicked in sequence

**Test Word:** Click "爸爸"
- Expected: Shows "bà bà" and "dad, father"

### 5. Display Toggles

- [ ] "Show Pinyin" checkbox is visible
- [ ] Unchecking hides all pinyin
- [ ] Checking shows all pinyin
- [ ] "Show Translation" checkbox is visible
- [ ] Unchecking hides all translations
- [ ] Checking shows all translations
- [ ] Both can be toggled independently

### 6. Quiz Tab

- [ ] Clicking "Quiz" tab switches view
- [ ] Quiz title displays: "Comprehension Quiz"
- [ ] Question counter shows: "Question 1 of 3"
- [ ] Question text is displayed
- [ ] Four answer options are visible
- [ ] Clicking an answer shows result
- [ ] Correct answer shows green
- [ ] Wrong answer shows red
- [ ] "Next Question" button appears after answering
- [ ] After all questions, score is displayed
- [ ] Progress bar shows percentage
- [ ] "Try Again" button restarts quiz

### 7. Progress Tab

- [ ] Clicking "Progress" tab switches view
- [ ] Title displays: "Your Progress"
- [ ] Three stat boxes show:
  - [ ] Sessions count
  - [ ] Total minutes
  - [ ] Sentences practiced
- [ ] Numbers update after practice
- [ ] Recent sessions list appears
- [ ] Sessions show date and duration

## ✅ Browser Compatibility

### Chrome
- [ ] All features work
- [ ] Speech recognition works
- [ ] Text-to-speech works
- [ ] No console errors

### Edge
- [ ] All features work
- [ ] Speech recognition works
- [ ] Text-to-speech works
- [ ] No console errors

### Safari (if testing)
- [ ] Basic features work
- [ ] Speech recognition limited/not working (expected)
- [ ] Text-to-speech works

### Firefox (if testing)
- [ ] Basic features work
- [ ] Speech recognition not working (expected)
- [ ] Text-to-speech works

## ✅ Data Persistence

- [ ] Practice for 1 minute
- [ ] Close browser
- [ ] Reopen http://localhost:5173
- [ ] Click Progress tab
- [ ] Previous session should be saved

## ✅ Error Handling

### Test Backend Connection Error

1. Stop backend server (Ctrl+C in backend terminal)
2. Refresh frontend
3. Expected:
   - [ ] Error message displays
   - [ ] Message says backend is not running
   - [ ] "Try Again" button appears
   - [ ] Instructions to start backend show

4. Restart backend
5. Click "Try Again"
6. Expected:
   - [ ] App loads successfully
   - [ ] Article displays

### Test Microphone Permission Denied

1. Click "Start Reading"
2. Deny microphone permission
3. Expected:
   - [ ] Error message appears
   - [ ] Suggests checking permissions

## ✅ Performance

- [ ] Page loads in < 2 seconds
- [ ] Speech recognition responds quickly
- [ ] Text-to-speech starts without delay
- [ ] UI interactions are smooth
- [ ] No lag when typing/clicking
- [ ] Tab switching is instant

## ✅ Mobile Responsiveness

If testing on mobile/tablet:

- [ ] Layout adjusts to screen size
- [ ] Buttons are large enough to tap
- [ ] Text is readable
- [ ] All features accessible
- [ ] No horizontal scrolling

## ✅ Code Quality

- [ ] No linter errors in frontend
  ```bash
  cd frontend && npm run build
  # Should complete without errors
  ```

- [ ] No Python errors in backend
  ```bash
  cd backend && source venv/bin/activate && python -c "import main"
  # Should complete without errors
  ```

- [ ] All files have proper formatting
- [ ] Code is readable and well-commented

## ✅ Documentation

- [ ] README.md is complete
- [ ] QUICK_START.md provides clear instructions
- [ ] FEATURES_DEMO.md explains all features
- [ ] CUSTOMIZATION.md shows how to customize
- [ ] PROJECT_SUMMARY.md gives overview
- [ ] All links work

## 🎯 Final Verification Score

Count your checkmarks:

- **80-100%**: Excellent! Everything working perfectly.
- **60-79%**: Good! Minor issues to address.
- **40-59%**: Fair. Some features need attention.
- **<40%**: Needs troubleshooting. Check QUICK_START.md.

## 🐛 If Something Doesn't Work

### First Steps:
1. Check both servers are running
2. Clear browser cache
3. Try in Chrome/Edge
4. Check console for errors (F12 in browser)
5. Restart both servers

### Still Not Working?
1. Read QUICK_START.md troubleshooting section
2. Check terminal output for error messages
3. Verify all dependencies installed
4. Make sure Python 3.9+ and Node 18+
5. Try on different browser

## ✅ Ready for Production

All items should be checked for production readiness:

- [ ] All features verified working
- [ ] No critical errors
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Custom article added (optional)
- [ ] Customization done (optional)

## 🎊 Verification Complete!

If all critical items are checked, your ChineseFlow installation is ready to use!

**Start learning Chinese now! 加油！**

---

**Date:** _______________  
**Verified By:** _______________  
**Score:** _____ / _____ items checked  
**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________________________________________

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypinyin import pinyin, Style
import jieba
import json
from pathlib import Path
from typing import List, Dict, Optional
from pydantic import BaseModel
from database import (
    add_character_full, get_character_full, get_all_characters, get_todays_characters,
    update_character_progress, get_learning_stats, init_db, seed_sample_data,
    add_word, get_words_by_character, get_all_words, update_word, delete_word, get_word_by_id, get_word_by_text,
    get_learned_characters, update_character_by_id,
    # User management
    get_all_users, create_user, get_user_by_id, update_user, delete_user,
    get_user_character_progress, update_user_character_progress, get_user_learning_stats
)
from ai_service import (
    generate_character_content, generate_character_image, test_api_key,
    AISettings, CharacterContent
)
from settings_manager import load_settings, save_settings, update_settings

app = FastAPI(title="ChineseFlow API")

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data directory
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# ==================== Models ====================

class Word(BaseModel):
    text: str
    pinyin: str
    translation: Optional[str] = None


class Sentence(BaseModel):
    id: int
    chinese: str
    pinyin: str
    translation: str
    words: List[Word]


class Article(BaseModel):
    title: str
    level: str
    sentences: List[Sentence]


class ProgressSession(BaseModel):
    timestamp: str
    duration_seconds: int
    sentences_practiced: int


# Traditional Character Card Format Models
class CharacterCreate(BaseModel):
    character: str
    pinyin: Optional[str] = ""
    alt_pinyin: Optional[str] = ""
    radical: Optional[str] = ""
    stroke_count: Optional[int] = 0
    stroke_order: Optional[str] = ""
    illustration_desc: Optional[str] = ""
    illustration_image: Optional[str] = ""
    rhyme_text: Optional[str] = ""
    ancient_forms: Optional[Dict[str, str]] = None
    etymology: Optional[str] = ""
    word_groups: Optional[Dict[str, List[str]]] = None
    famous_quotes: Optional[List[Dict[str, str]]] = None
    character_structure: Optional[Dict] = None
    meaning: Optional[str] = ""


class CharacterResponse(BaseModel):
    id: int
    character: str
    pinyin: str
    alt_pinyin: Optional[str]
    radical: str
    stroke_count: int
    stroke_order: str
    illustration_desc: str
    illustration_image: Optional[str]
    rhyme_text: str
    ancient_forms: Dict[str, str]
    etymology: str
    word_groups: Dict[str, List[str]]
    famous_quotes: List[Dict[str, str]]
    character_structure: Dict
    meaning: str
    created_at: str


class CharacterListItem(BaseModel):
    id: int
    character: str
    pinyin: str
    radical: str
    stroke_count: int


class LearningStats(BaseModel):
    total_characters: int
    today_characters: int
    learned_characters: int


# ==================== Helper Functions ====================

def get_pinyin_for_text(text: str) -> str:
    """Get pinyin for Chinese text"""
    pinyin_list = pinyin(text, style=Style.TONE)
    return " ".join([p[0] for p in pinyin_list])


def segment_and_get_words(sentence: str, translations: Optional[Dict[str, str]] = None) -> List[Word]:
    """Segment Chinese sentence into words with pinyin"""
    words = jieba.cut(sentence)
    word_list = []
    
    for word in words:
        if word.strip():
            word_pinyin = get_pinyin_for_text(word)
            translation = translations.get(word) if translations else None
            word_list.append(Word(
                text=word,
                pinyin=word_pinyin,
                translation=translation
            ))
    
    return word_list


def load_article() -> Optional[Article]:
    """Load article from JSON file"""
    article_file = DATA_DIR / "article.json"
    if article_file.exists():
        with open(article_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return Article(**data)
    return None


def save_article(article: Article):
    """Save article to JSON file"""
    article_file = DATA_DIR / "article.json"
    with open(article_file, "w", encoding="utf-8") as f:
        json.dump(article.model_dump(), f, ensure_ascii=False, indent=2)


def create_sample_article():
    """Create a sample article for demonstration"""
    sample_data = {
        "title": "我的家人",
        "level": "intermediate",
        "sentences": [
            {
                "id": 1,
                "chinese": "我家有四口人：爸爸、妈妈、哥哥和我。",
                "pinyin": "wǒ jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ.",
                "translation": "There are four people in my family: dad, mom, older brother, and me.",
                "words": []
            },
            {
                "id": 2,
                "chinese": "我的爸爸是一名医生，他每天工作很忙。",
                "pinyin": "wǒ de bàba shì yī míng yīshēng, tā měi tiān gōngzuò hěn máng.",
                "translation": "My dad is a doctor, and he is very busy with work every day.",
                "words": []
            },
            {
                "id": 3,
                "chinese": "妈妈是老师，她很喜欢她的学生。",
                "pinyin": "māma shì lǎoshī, tā hěn xǐhuan tā de xuésheng.",
                "translation": "Mom is a teacher, and she really likes her students.",
                "words": []
            },
            {
                "id": 4,
                "chinese": "我的哥哥正在上大学，他学习计算机科学。",
                "pinyin": "wǒ de gēge zhèngzài shàng dàxué, tā xuéxí jìsuànjī kēxué.",
                "translation": "My older brother is in college, and he studies computer science.",
                "words": []
            },
            {
                "id": 5,
                "chinese": "我今年十六岁，是一名高中生。",
                "pinyin": "wǒ jīnnián shíliù suì, shì yī míng gāozhōngshēng.",
                "translation": "I am sixteen years old this year, and I'm a high school student.",
                "words": []
            }
        ]
    }
    
    # Generate words for each sentence
    word_translations = {
        "我": "I, me",
        "家": "family, home",
        "有": "have",
        "四": "four",
        "口": "measure word for people",
        "人": "person, people",
        "爸爸": "dad, father",
        "妈妈": "mom, mother",
        "哥哥": "older brother",
        "和": "and",
        "的": "possessive particle",
        "是": "is, am, are",
        "一名": "one (for people)",
        "医生": "doctor",
        "他": "he, him",
        "每天": "every day",
        "工作": "work",
        "很": "very",
        "忙": "busy",
        "老师": "teacher",
        "她": "she, her",
        "喜欢": "like, love",
        "学生": "student",
        "正在": "currently (in progress)",
        "上": "attend, go to",
        "大学": "university, college",
        "学习": "study, learn",
        "计算机": "computer",
        "科学": "science",
        "今年": "this year",
        "十六": "sixteen",
        "岁": "years old",
        "高中生": "high school student"
    }
    
    for sentence in sample_data["sentences"]:
        sentence["words"] = [
            w.model_dump() for w in segment_and_get_words(
                sentence["chinese"], 
                word_translations
            )
        ]
    
    return Article(**sample_data)


# ==================== API Routes ====================

@app.get("/")
async def root():
    return {"message": "ChineseFlow API", "version": "1.0"}


@app.get("/api/article", response_model=Article)
async def get_article():
    """Get the current article"""
    article = load_article()
    if not article:
        article = create_sample_article()
        save_article(article)
    return article


@app.post("/api/article", response_model=Article)
async def update_article(article: Article):
    """Update the article"""
    for sentence in article.sentences:
        if not sentence.pinyin or sentence.pinyin.strip() == '':
            sentence.pinyin = get_pinyin_for_text(sentence.chinese)
        if not sentence.words:
            sentence.words = segment_and_get_words(sentence.chinese)
    
    save_article(article)
    return article


@app.get("/api/word/{word}", response_model=Word)
async def get_word_info(word: str):
    """Get information about a specific word"""
    pinyin_text = get_pinyin_for_text(word)
    return Word(text=word, pinyin=pinyin_text)


@app.post("/api/progress")
async def save_progress(session: ProgressSession):
    """Save a practice session"""
    progress_file = DATA_DIR / "progress.json"
    
    progress = []
    if progress_file.exists():
        with open(progress_file, "r", encoding="utf-8") as f:
            progress = json.load(f)
    
    progress.append(session.model_dump())
    
    with open(progress_file, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)
    
    return {"message": "Progress saved successfully"}


@app.get("/api/progress")
async def get_progress():
    """Get all practice sessions"""
    progress_file = DATA_DIR / "progress.json"
    
    if progress_file.exists():
        with open(progress_file, "r", encoding="utf-8") as f:
            return json.load(f)
    
    return []


# ==================== Character Learning APIs ====================

@app.post("/api/characters", response_model=dict)
async def create_character(char_data: CharacterCreate):
    """Add a new character with full traditional format"""
    char_id = add_character_full(
        character=char_data.character,
        pinyin=char_data.pinyin or get_pinyin_for_text(char_data.character),
        alt_pinyin=char_data.alt_pinyin,
        radical=char_data.radical,
        stroke_count=char_data.stroke_count,
        stroke_order=char_data.stroke_order,
        illustration_desc=char_data.illustration_desc,
        illustration_image=char_data.illustration_image,
        rhyme_text=char_data.rhyme_text,
        ancient_forms=char_data.ancient_forms,
        etymology=char_data.etymology,
        word_groups=char_data.word_groups,
        famous_quotes=char_data.famous_quotes,
        character_structure=char_data.character_structure,
        meaning=char_data.meaning
    )
    return {"id": char_id, "message": "Character added successfully"}


@app.get("/api/characters")
async def list_characters():
    """Get all characters"""
    return get_all_characters()


@app.get("/api/characters/today")
async def get_today_characters():
    """Get today's scheduled characters"""
    result = get_todays_characters()
    print(f"DEBUG: Returning {len(result)} characters")
    return result


@app.get("/api/characters/status/learned")
async def get_learned():
    """Get all learned characters"""
    return get_learned_characters()


@app.get("/api/characters/{character}", response_model=CharacterResponse)
async def get_character_details(character: str):
    """Get detailed information about a character in traditional format"""
    char = get_character_full(character)
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return char


@app.post("/api/characters/{character_id}/progress")
async def mark_character_progress(character_id: int, proficiency: Optional[int] = None):
    """Mark a character as learned/update progress"""
    update_character_progress(character_id, proficiency)
    return {"message": "Progress updated successfully"}


# ==================== Learning Stats API ====================

@app.get("/api/stats", response_model=LearningStats)
async def get_stats():
    """Get learning statistics"""
    return get_learning_stats()


# ==================== User Management APIs ====================

class UserCreate(BaseModel):
    username: str
    display_name: Optional[str] = None
    avatar: Optional[str] = None

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    display_name: Optional[str]
    avatar: Optional[str]
    created_at: str

@app.get("/api/users", response_model=List[UserResponse])
async def list_users():
    """Get all users"""
    return get_all_users()

@app.post("/api/users", response_model=Dict)
async def create_new_user(user: UserCreate):
    """Create a new user"""
    user_id = create_user(user.username, user.display_name, user.avatar)
    if user_id == 0:
        raise HTTPException(status_code=400, detail="Username already exists")
    return {"id": user_id, "message": "User created successfully"}

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Get user by ID"""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/users/{user_id}")
async def update_existing_user(user_id: int, user: UserUpdate):
    """Update user information"""
    success = update_user(user_id, user.display_name, user.avatar)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update user")
    return {"message": "User updated successfully"}

@app.delete("/api/users/{user_id}")
async def delete_existing_user(user_id: int):
    """Delete a user"""
    # Prevent deleting default user
    if user_id == 1:
        raise HTTPException(status_code=400, detail="Cannot delete default user")
    success = delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@app.get("/api/users/{user_id}/progress")
async def get_user_progress(user_id: int):
    """Get user's character learning progress"""
    return get_user_character_progress(user_id)

class UserProgressUpdate(BaseModel):
    character_id: int
    is_learned: bool
    proficiency: Optional[int] = None

@app.post("/api/users/{user_id}/progress")
async def update_user_progress(user_id: int, progress: UserProgressUpdate):
    """Update user's character learning progress"""
    success = update_user_character_progress(
        user_id, 
        progress.character_id, 
        progress.is_learned,
        progress.proficiency
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update progress")
    return {"message": "Progress updated successfully"}

@app.get("/api/users/{user_id}/stats")
async def get_user_stats(user_id: int):
    """Get user's learning statistics"""
    return get_user_learning_stats(user_id)


# ==================== AI Generation APIs ====================

class AIGenerateRequest(BaseModel):
    character: str
    provider: str
    api_key: str
    model: str


class AIGenerateResponse(BaseModel):
    success: bool
    data: Optional[CharacterContent] = None
    error: Optional[str] = None


@app.post("/api/ai/generate-content", response_model=AIGenerateResponse)
async def ai_generate_content(request: AIGenerateRequest):
    """Generate character content using AI"""
    try:
        settings = AISettings(
            provider=request.provider,
            api_key=request.api_key,
            model=request.model
        )
        
        print(f"Generating content for character: {request.character}, model: {request.model}")
        
        content = generate_character_content(request.character, settings)
        
        if content:
            return AIGenerateResponse(success=True, data=content)
        else:
            return AIGenerateResponse(success=False, error="AI 返回内容解析失败，请检查 API Key 是否正确")
    
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"AI generation error: {error_msg}")
        traceback.print_exc()
        return AIGenerateResponse(success=False, error=f"API 调用失败: {error_msg}")


class AIGenerateImageRequest(BaseModel):
    character: str
    illustration_desc: str
    provider: str
    api_key: str
    model: str


class AIGenerateImageResponse(BaseModel):
    success: bool
    image_path: Optional[str] = None
    message: str = ""
    error: Optional[str] = None


@app.post("/api/ai/generate-image", response_model=AIGenerateImageResponse)
async def ai_generate_image(request: AIGenerateImageRequest):
    """Generate character illustration image using AI"""
    try:
        settings = AISettings(
            provider=request.provider,
            api_key=request.api_key,
            model=request.model
        )
        
        # Output directory for images
        output_dir = Path(__file__).parent / ".." / "frontend" / "public" / "images" / "characters"
        
        success, message, image_path = generate_character_image(
            request.character,
            request.illustration_desc,
            settings,
            str(output_dir)
        )
        
        if success and image_path:
            return AIGenerateImageResponse(success=True, image_path=image_path, message=message)
        else:
            return AIGenerateImageResponse(success=False, error=message, message=message)
    
    except Exception as e:
        import traceback
        error_detail = str(e)
        print(f"Image generation exception: {error_detail}")
        traceback.print_exc()
        return AIGenerateImageResponse(success=False, error=error_detail, message=f"生成失败: {error_detail}")


class AIGenerateWordRequest(BaseModel):
    word: str

@app.post("/api/ai/generate-word")
async def ai_generate_word(request: AIGenerateWordRequest):
    """Generate word details using AI"""
    try:
        settings_dict = load_settings()
        if not settings_dict.get('apiKey'):
            return {"success": False, "error": "AI settings not configured"}
        
        settings = AISettings(
            provider=settings_dict.get('provider', 'kimi'),
            api_key=settings_dict.get('apiKey'),
            model=settings_dict.get('model', 'kimi-latest')
        )
        
        # Generate word content using AI
        from ai_service import generate_word_content
        result = generate_word_content(request.word, settings)
        
        if result:
            return {"success": True, "data": result}
        else:
            return {"success": False, "error": "Failed to generate word content"}
    
    except Exception as e:
        import traceback
        error_detail = str(e)
        print(f"Word generation exception: {error_detail}")
        traceback.print_exc()
        return {"success": False, "error": error_detail}


@app.post("/api/characters/{character_id}/update")
async def update_character_full(character_id: int, update_data: dict):
    """Update character with AI generated content"""
    try:
        success = update_character_by_id(
            character_id=character_id,
            character=update_data.get("character"),
            pinyin=update_data.get("pinyin"),
            alt_pinyin=update_data.get("alt_pinyin"),
            radical=update_data.get("radical"),
            stroke_count=update_data.get("stroke_count"),
            stroke_order=update_data.get("stroke_order"),
            illustration_desc=update_data.get("illustration_desc"),
            illustration_image=update_data.get("illustration_image"),
            rhyme_text=update_data.get("rhyme_text"),
            ancient_forms=update_data.get("ancient_forms"),
            etymology=update_data.get("etymology"),
            word_groups=update_data.get("word_groups"),
            famous_quotes=update_data.get("famous_quotes"),
            character_structure=update_data.get("character_structure"),
            meaning=update_data.get("meaning")
        )
        if success:
            return {"id": character_id, "message": "Character updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update character")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Settings APIs ====================

class DatabaseConfig(BaseModel):
    type: str = "sqlite"
    postgresql_url: str = ""

class SettingsResponse(BaseModel):
    provider: str
    apiKey: str
    model: str
    database: DatabaseConfig = DatabaseConfig()


@app.get("/api/settings", response_model=SettingsResponse)
async def get_settings():
    """Get current settings from settings.json"""
    settings = load_settings()
    return SettingsResponse(**settings)


@app.post("/api/settings")
async def save_settings_api(settings: SettingsResponse):
    """Save settings to settings.json"""
    success = save_settings(settings.model_dump())
    if success:
        return {"message": "Settings saved successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to save settings")


@app.post("/api/settings/update")
async def update_settings_api(updates: dict):
    """Update specific settings fields"""
    updated = update_settings(updates)
    return {"message": "Settings updated", "settings": updated}


@app.post("/api/settings/test")
async def test_settings_api():
    """Test if current API key is valid"""
    settings_dict = load_settings()
    
    if not settings_dict.get('apiKey'):
        return {"valid": False, "message": "API Key 未设置"}
    
    settings = AISettings(
        provider=settings_dict['provider'],
        api_key=settings_dict['apiKey'],
        model=settings_dict['model']
    )
    
    valid, message = test_api_key(settings)
    return {"valid": valid, "message": message}


# ==================== Word Management APIs ====================

class WordCreate(BaseModel):
    word: str
    pinyin: Optional[str] = ""
    chinese_meaning: Optional[str] = ""
    english_translation: Optional[str] = ""
    character_id: Optional[int] = None
    display: Optional[bool] = False


class WordUpdate(BaseModel):
    word: Optional[str] = None
    pinyin: Optional[str] = None
    chinese_meaning: Optional[str] = None
    english_translation: Optional[str] = None
    display: Optional[bool] = None


@app.post("/api/words")
async def create_word(word_data: WordCreate):
    """Add a new word"""
    word_id = add_word(
        word=word_data.word,
        pinyin=word_data.pinyin,
        chinese_meaning=word_data.chinese_meaning,
        english_translation=word_data.english_translation,
        character_id=word_data.character_id,
        display=word_data.display
    )
    if word_id:
        return {"id": word_id, "message": "Word added successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to add word")


@app.get("/api/words")
async def list_words():
    """Get all words for display"""
    return get_all_words()


@app.get("/api/words/character/{character_id}")
async def get_character_words(character_id: int):
    """Get words related to a character"""
    return get_words_by_character(character_id)


@app.get("/api/words/search/{word_text}")
async def search_word(word_text: str):
    """Search word by text"""
    word = get_word_by_text(word_text)
    if word:
        return word
    else:
        raise HTTPException(status_code=404, detail="Word not found")


@app.get("/api/words/{word_id}")
async def get_word(word_id: int):
    """Get word by ID"""
    word = get_word_by_id(word_id)
    if word:
        return word
    else:
        raise HTTPException(status_code=404, detail="Word not found")


@app.put("/api/words/{word_id}")
async def update_word_api(word_id: int, updates: WordUpdate):
    """Update word information"""
    success = update_word(word_id, updates.model_dump(exclude_unset=True))
    if success:
        return {"message": "Word updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update word")


@app.delete("/api/words/{word_id}")
async def delete_word_api(word_id: int):
    """Delete a word"""
    success = delete_word(word_id)
    if success:
        return {"message": "Word deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete word")


@app.post("/api/words/{word_id}/generate")
async def generate_word_content(word_id: int):
    """Generate word content using AI"""
    word = get_word_by_id(word_id)
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
    
    # Load settings
    settings_dict = load_settings()
    if not settings_dict.get('apiKey'):
        raise HTTPException(status_code=400, detail="AI settings not configured")
    
    settings = AISettings(
        provider=settings_dict['provider'],
        api_key=settings_dict['apiKey'],
        model=settings_dict['model']
    )
    
    # Generate content using AI
    system_prompt = f"""你是一个中文词典专家。请为词语"{word['word']}"生成详细的解释。
请按照以下JSON格式返回：

{{
    "pinyin": "拼音（带声调）",
    "chinese_meaning": "中文详细解释",
    "english_translation": "英文翻译"
}}

要求：
1. 拼音必须带声调
2. 中文解释要详细、准确
3. 英文翻译要地道
"""
    
    try:
        from ai_service import _call_kimi
        content = _call_kimi(system_prompt, f"请解释词语：{word['word']}", settings)
        
        if content:
            # Parse the response
            import json
            data = json.loads(content)
            
            # Update word
            update_word(word_id, {
                'pinyin': data.get('pinyin', word['pinyin']),
                'chinese_meaning': data.get('chinese_meaning', word['chinese_meaning']),
                'english_translation': data.get('english_translation', word['english_translation']),
                'is_ai_generated': True
            })
            
            return {"message": "Content generated successfully", "data": data}
        else:
            raise HTTPException(status_code=500, detail="Failed to generate content")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Seed Data Endpoint ====================

@app.post("/api/seed")
async def seed_data():
    """Seed database with sample characters"""
    seed_sample_data()
    return {"message": "Sample data seeded successfully"}


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting ChineseFlow API server...")
    print("📚 API Documentation: http://localhost:8000/docs")
    
    # Seed sample data on startup if database is empty
    import sqlite3
    conn = sqlite3.connect(str(DATA_DIR / "chinese_learning.db"))
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM characters")
    count = cursor.fetchone()[0]
    conn.close()
    
    if count == 0:
        print("📝 Seeding sample data...")
        seed_sample_data()
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

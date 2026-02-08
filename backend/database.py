"""
SQLite Database for Chinese Learning Platform - Traditional Character Card Format
"""
import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from dataclasses import dataclass

DB_PATH = Path(__file__).parent / "data" / "chinese_learning.db"


# Import database manager for PostgreSQL support
try:
    from db_manager import get_db, init_db as _init_db, get_db_type
    POSTGRES_SUPPORT = True
except ImportError:
    POSTGRES_SUPPORT = False
    def get_db():
        """Fallback to SQLite"""
        DB_PATH.parent.mkdir(exist_ok=True)
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row
        return conn
    def _init_db():
        pass
    def get_db_type():
        return 'sqlite'


def init_db():
    """Initialize database with tables for traditional character card format"""
    # Use db_manager's init if available
    if POSTGRES_SUPPORT:
        _init_db()
        return
    
    # Fallback to SQLite init
    conn = get_db()
    cursor = conn.cursor()
    
    # Characters table - stores detailed character info in traditional format
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character TEXT NOT NULL UNIQUE,
            pinyin TEXT,
            alt_pinyin TEXT,           --  alternative reading (e.g., 把: bà)
            
            -- Header info
            radical TEXT,              -- 部首
            stroke_count INTEGER,      -- 笔画数
            stroke_order TEXT,         -- 笔顺
            
            -- Left side content
            illustration_desc TEXT,    -- 插图描述
            illustration_image TEXT,   -- 插图图片路径
            rhyme_text TEXT,           -- 儿歌/口诀
            
            -- Right side content
            ancient_forms TEXT,        -- JSON: {"bronze": "...", "seal": "...", "clerical": "..."}
            etymology TEXT,            -- 释源
            
            -- Word groups (组词句) - JSON format
            word_groups TEXT,          -- JSON: {"ba3": [...], "ba4": [...]}
            
            -- Famous quotes (名句)
            famous_quotes TEXT,        -- JSON array of {quote, author, source}
            
            -- Character structure (构字)
            character_structure TEXT,  -- JSON: {related_chars, explanation}
            
            -- Meaning
            meaning TEXT,              -- 基本释义
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Character learning progress
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS character_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            learned_date DATE DEFAULT CURRENT_DATE,
            review_count INTEGER DEFAULT 0,
            last_reviewed TIMESTAMP,
            proficiency INTEGER DEFAULT 0,
            FOREIGN KEY (character_id) REFERENCES characters(id)
        )
    """)
    
    # Character learning schedule
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS character_schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            scheduled_date DATE NOT NULL,
            is_learned BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (character_id) REFERENCES characters(id)
        )
    """)
    
    # Words table - stores words/phrases related to characters
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            pinyin TEXT,
            chinese_meaning TEXT,
            english_translation TEXT,
            character_id INTEGER,           -- Related character
            display BOOLEAN DEFAULT FALSE,  -- Whether to display in word list
            is_ai_generated BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (character_id) REFERENCES characters(id)
        )
    """)
    
    # Users table - stores user information
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            display_name TEXT,
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # User character progress - stores learning progress per user
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_character_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            character_id INTEGER NOT NULL,
            learned_date DATE DEFAULT CURRENT_DATE,
            review_count INTEGER DEFAULT 0,
            last_reviewed TIMESTAMP,
            proficiency INTEGER DEFAULT 0,  -- 0-100
            is_learned BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (character_id) REFERENCES characters(id),
            UNIQUE(user_id, character_id)
        )
    """)
    
    # Insert default user if not exists
    cursor.execute("""
        INSERT OR IGNORE INTO users (id, username, display_name) 
        VALUES (1, 'default', 'Default User')
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized with traditional character card format")


def add_character_full(
    character: str,
    pinyin: str = "",
    alt_pinyin: str = "",
    radical: str = "",
    stroke_count: int = 0,
    stroke_order: str = "",
    illustration_desc: str = "",
    illustration_image: str = "",
    rhyme_text: str = "",
    ancient_forms: Optional[Dict[str, str]] = None,
    etymology: str = "",
    word_groups: Optional[Dict[str, List[str]]] = None,
    famous_quotes: Optional[List[Dict[str, str]]] = None,
    character_structure: Optional[Dict[str, Any]] = None,
    meaning: str = ""
) -> int:
    """Add a new character with full traditional format details"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        db_type = get_db_type()
        
        if db_type == 'postgresql':
            # PostgreSQL uses INSERT ... ON CONFLICT
            cursor.execute("""
                INSERT INTO characters 
                (character, pinyin, alt_pinyin, radical, stroke_count, stroke_order,
                 illustration_desc, illustration_image, rhyme_text, ancient_forms, etymology,
                 word_groups, famous_quotes, character_structure, meaning)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (character) DO UPDATE SET
                    pinyin = EXCLUDED.pinyin,
                    alt_pinyin = EXCLUDED.alt_pinyin,
                    radical = EXCLUDED.radical,
                    stroke_count = EXCLUDED.stroke_count,
                    stroke_order = EXCLUDED.stroke_order,
                    illustration_desc = EXCLUDED.illustration_desc,
                    illustration_image = EXCLUDED.illustration_image,
                    rhyme_text = EXCLUDED.rhyme_text,
                    ancient_forms = EXCLUDED.ancient_forms,
                    etymology = EXCLUDED.etymology,
                    word_groups = EXCLUDED.word_groups,
                    famous_quotes = EXCLUDED.famous_quotes,
                    character_structure = EXCLUDED.character_structure,
                    meaning = EXCLUDED.meaning,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id
            """, (
                character,
                pinyin,
                alt_pinyin,
                radical,
                stroke_count,
                stroke_order,
                illustration_desc,
                illustration_image,
                rhyme_text,
                json.dumps(ancient_forms or {}, ensure_ascii=False),
                etymology,
                json.dumps(word_groups or {}, ensure_ascii=False),
                json.dumps(famous_quotes or [], ensure_ascii=False),
                json.dumps(character_structure or {}, ensure_ascii=False),
                meaning
            ))
            char_id = cursor.fetchone()['id']
            
            # Add to today's schedule if new
            cursor.execute(
                "SELECT id FROM character_schedule WHERE character_id = ? AND scheduled_date = CURRENT_DATE",
                (char_id,)
            )
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO character_schedule (character_id, scheduled_date)
                    VALUES (?, CURRENT_DATE)
                """, (char_id,))
        else:
            # SQLite uses INSERT OR REPLACE
            cursor.execute("""
                INSERT OR REPLACE INTO characters 
                (character, pinyin, alt_pinyin, radical, stroke_count, stroke_order,
                 illustration_desc, illustration_image, rhyme_text, ancient_forms, etymology,
                 word_groups, famous_quotes, character_structure, meaning)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                character,
                pinyin,
                alt_pinyin,
                radical,
                stroke_count,
                stroke_order,
                illustration_desc,
                illustration_image,
                rhyme_text,
                json.dumps(ancient_forms or {}, ensure_ascii=False),
                etymology,
                json.dumps(word_groups or {}, ensure_ascii=False),
                json.dumps(famous_quotes or [], ensure_ascii=False),
                json.dumps(character_structure or {}, ensure_ascii=False),
                meaning
            ))
            char_id = cursor.lastrowid
            
            # Add to today's schedule if new
            cursor.execute(
                "SELECT id FROM character_schedule WHERE character_id = ? AND scheduled_date = DATE('now')",
                (char_id,)
            )
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO character_schedule (character_id, scheduled_date)
                    VALUES (?, DATE('now'))
                """, (char_id,))
        
        conn.commit()
        return char_id
    except Exception as e:
        print(f"Error adding character: {e}")
        conn.rollback()
        return 0
    finally:
        conn.close()


def update_character_by_id(
    character_id: int,
    character: str = None,
    pinyin: str = None,
    alt_pinyin: str = None,
    radical: str = None,
    stroke_count: int = None,
    stroke_order: str = None,
    illustration_desc: str = None,
    illustration_image: str = None,
    rhyme_text: str = None,
    ancient_forms: Optional[Dict[str, str]] = None,
    etymology: str = None,
    word_groups: Optional[Dict[str, List[str]]] = None,
    famous_quotes: Optional[List[Dict[str, str]]] = None,
    character_structure: Optional[Dict[str, Any]] = None,
    meaning: str = None
) -> bool:
    """Update character by ID - partial update (only update non-None fields)"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Build dynamic update query
        fields = []
        values = []
        
        if character is not None:
            fields.append("character = ?")
            values.append(character)
        if pinyin is not None:
            fields.append("pinyin = ?")
            values.append(pinyin)
        if alt_pinyin is not None:
            fields.append("alt_pinyin = ?")
            values.append(alt_pinyin)
        if radical is not None:
            fields.append("radical = ?")
            values.append(radical)
        if stroke_count is not None:
            fields.append("stroke_count = ?")
            values.append(stroke_count)
        if stroke_order is not None:
            fields.append("stroke_order = ?")
            values.append(stroke_order)
        if illustration_desc is not None:
            fields.append("illustration_desc = ?")
            values.append(illustration_desc)
        if illustration_image is not None:
            fields.append("illustration_image = ?")
            values.append(illustration_image)
        if rhyme_text is not None:
            fields.append("rhyme_text = ?")
            values.append(rhyme_text)
        if ancient_forms is not None:
            fields.append("ancient_forms = ?")
            values.append(json.dumps(ancient_forms, ensure_ascii=False))
        if etymology is not None:
            fields.append("etymology = ?")
            values.append(etymology)
        if word_groups is not None:
            fields.append("word_groups = ?")
            values.append(json.dumps(word_groups, ensure_ascii=False))
        if famous_quotes is not None:
            fields.append("famous_quotes = ?")
            values.append(json.dumps(famous_quotes, ensure_ascii=False))
        if character_structure is not None:
            fields.append("character_structure = ?")
            values.append(json.dumps(character_structure, ensure_ascii=False))
        if meaning is not None:
            fields.append("meaning = ?")
            values.append(meaning)
        
        if not fields:
            return True  # Nothing to update
        
        values.append(character_id)
        
        query = f"UPDATE characters SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(query, values)
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error updating character: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


def get_character_full(char: str) -> Optional[Dict]:
    """Get full character details in traditional format"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM characters WHERE character = ?", (char,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        # Helper to parse JSON fields (PostgreSQL returns dict/list, SQLite returns string)
        def parse_json(val, default):
            if val is None:
                return default
            if isinstance(val, str):
                return json.loads(val or json.dumps(default))
            return val
        
        return {
            'id': row['id'],
            'character': row['character'],
            'pinyin': row['pinyin'],
            'alt_pinyin': row['alt_pinyin'],
            'radical': row['radical'],
            'stroke_count': row['stroke_count'],
            'stroke_order': row['stroke_order'],
            'illustration_desc': row['illustration_desc'],
            'illustration_image': row['illustration_image'],
            'rhyme_text': row['rhyme_text'],
            'ancient_forms': parse_json(row['ancient_forms'], {}),
            'etymology': row['etymology'],
            'word_groups': parse_json(row['word_groups'], {}),
            'famous_quotes': parse_json(row['famous_quotes'], []),
            'character_structure': parse_json(row['character_structure'], {}),
            'meaning': row['meaning'],
            'created_at': _format_datetime(row['created_at'])
        }
    return None


def get_all_characters() -> List[Dict]:
    """Get all characters (summary)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, character, pinyin, radical, stroke_count, created_at 
        FROM characters 
        ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    return [{
        'id': row['id'],
        'character': row['character'],
        'pinyin': row['pinyin'],
        'radical': row['radical'],
        'stroke_count': row['stroke_count'],
        'created_at': _format_datetime(row['created_at'])
    } for row in rows]


def _format_datetime(val):
    """Format datetime value for JSON (handles both string and datetime)"""
    if val is None:
        return None
    if hasattr(val, 'isoformat'):
        return _format_datetime(val)
    return str(val)


def get_todays_characters() -> List[Dict]:
    """Get all characters (from character schedule)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT c.id, c.character, c.pinyin, c.radical, c.stroke_count, 
               cs.scheduled_date, cs.is_learned 
        FROM characters c
        JOIN character_schedule cs ON c.id = cs.character_id
        ORDER BY c.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    return [{
        'id': row['id'],
        'character': row['character'],
        'pinyin': row['pinyin'],
        'radical': row['radical'],
        'stroke_count': row['stroke_count'],
        'scheduled_date': row['scheduled_date'],
        'is_learned': row['is_learned'],
    } for row in rows]


def get_learned_characters() -> List[Dict]:
    """Get all learned characters"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT c.id, c.character, c.pinyin, c.radical, c.stroke_count, 
               cs.scheduled_date, cs.is_learned 
        FROM characters c
        JOIN character_schedule cs ON c.id = cs.character_id
        WHERE cs.is_learned = 1
        ORDER BY c.character
    """)
    rows = cursor.fetchall()
    conn.close()
    
    return [{
        'id': row['id'],
        'character': row['character'],
        'pinyin': row['pinyin'],
        'radical': row['radical'],
        'stroke_count': row['stroke_count'],
        'scheduled_date': row['scheduled_date'],
        'is_learned': row['is_learned'],
    } for row in rows]


def update_character_progress(character_id: int, proficiency: int = None):
    """Update learning progress for a character"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id FROM character_progress WHERE character_id = ?",
        (character_id,)
    )
    row = cursor.fetchone()
    
    if row:
        if proficiency is not None:
            cursor.execute("""
                UPDATE character_progress 
                SET review_count = review_count + 1,
                    last_reviewed = CURRENT_TIMESTAMP,
                    proficiency = ?
                WHERE character_id = ?
            """, (proficiency, character_id))
        else:
            cursor.execute("""
                UPDATE character_progress 
                SET review_count = review_count + 1,
                    last_reviewed = CURRENT_TIMESTAMP
                WHERE character_id = ?
            """, (character_id,))
    else:
        cursor.execute("""
            INSERT INTO character_progress (character_id, proficiency)
            VALUES (?, ?)
        """, (character_id, proficiency or 0))
    
    cursor.execute("""
        UPDATE character_schedule 
        SET is_learned = TRUE 
        WHERE character_id = ? AND scheduled_date = DATE('now')
    """, (character_id,))
    
    conn.commit()
    conn.close()


def get_learning_stats() -> Dict:
    """Get learning statistics"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as count FROM characters")
    total_chars = cursor.fetchone()['count']
    
    cursor.execute("""
        SELECT COUNT(*) as count FROM character_schedule 
        WHERE scheduled_date = DATE('now')
    """)
    today_chars = cursor.fetchone()['count']
    
    cursor.execute("""
        SELECT COUNT(*) as count FROM character_schedule 
        WHERE is_learned = TRUE
    """)
    learned_chars = cursor.fetchone()['count']
    
    conn.close()
    
    return {
        'total_characters': total_chars,
        'today_characters': today_chars,
        'learned_characters': learned_chars
    }


def seed_sample_data():
    """Seed database with sample characters from photos"""
    # Character: 把 (bǎ/bà)
    add_character_full(
        character="把",
        pinyin="bǎ",
        alt_pinyin="bà",
        radical="扌",
        stroke_count=7,
        stroke_order="一 亅 ㇀ 𠃍 丨 一 乚",
        illustration_desc="伸出一只手，抓住东西。",
        illustration_image="/images/characters/ba_illustration.png",
        rhyme_text="""伸出一只手，
抓住跪坐人。
手把手地教，
抓住话把(bà)儿。""",
        ancient_forms={
            "bronze": "把",
            "seal": "把", 
            "clerical": "把"
        },
        etymology="""形声字。扌(手)是形符，表示手的动作；巴是声符。
本义表示拿，抓住。
又读bà，为器具上便于用手拿的部分及花、叶或果实的柄。""",
        word_groups={
            "ba3": ["bǎ 把握", "把守", "把玩", "把关", "把脉", "车把", "火把", "倒把", 
                   "一把汗", "千把高", "手把手", "把薪助火", "拜把兄弟"],
            "ba4": ["bà 刀把子", "话把儿(被人作为谈笑资料的言论或行为)", "锄把儿"]
        },
        famous_quotes=[
            {
                "quote": "欲把西湖比西子，淡妆浓抹总相宜。",
                "author": "宋·苏轼",
                "source": "《饮湖上初晴后雨》"
            }
        ],
        character_structure={
            "base_char": "把",
            "related": [
                {"char": "筢", "pinyin": "pá", "meaning": "用竹子、铁丝等制成，搂(lōu)柴草、树叶的器具。"}
            ]
        },
        meaning="拿，抓住；也指器物的手柄部分"
    )
    
    # Character: 爸 (bà)
    add_character_full(
        character="爸",
        pinyin="bà",
        radical="父",
        stroke_count=8,
        stroke_order="ノ 丶 ノ ㇏ 丨 𠃍 一 乚",
        illustration_desc="父亲牵着孩子的手。",
        illustration_image="/images/characters/ba_father_illustration.png",
        rhyme_text="""父亲是家长，
对儿女有巴望；
爸爸是家长，
严要求爱无疆。""",
        ancient_forms={
            "bronze": "爸",
            "seal": "爸",
            "clerical": "爸"
        },
        etymology="""形声字。父(甲骨文像手握石斧的样子，手握斧子劳动是很重的体力活，
是由父亲担当的)表示意义，巴是声符。
本义表示父亲。""",
        word_groups={
            "ba4": ["爸妈", "阿爸", "老爸"]
        },
        famous_quotes=[
            {
                "quote": "被他爸爸回来，一头撞见，气了个半死。",
                "author": "清·刘鹗",
                "source": "《老残游记》"
            },
            {
                "quote": "这个地方离三爸的律师事务所不远，三爸怎么会不晓得？",
                "author": "巴金",
                "source": "《家》"
            }
        ],
        character_structure={
            "base_char": "爸",
            "related": []
        },
        meaning="父亲"
    )
    
    # Character: 百 (bǎi)
    add_character_full(
        character="百",
        pinyin="bǎi",
        radical="一",
        stroke_count=6,
        stroke_order="一 ノ 丨 𠃍 一 一",
        illustration_desc="一把尺子和一百粒米。",
        illustration_image="/images/characters/bai_illustration.png",
        rhyme_text="""一把尺子，
排黍(shǔ)百粒，
百花齐放，
千方百计。""",
        ancient_forms={
            "oracle": "百",
            "bronze": "百",
            "seal": "百"
        },
        etymology="""上面是一把尺子，下面摆放着一粒黍(shǔ)米。
摆一尺长的黍米要用一百粒。
本义十个十，又引申泛指数目。""",
        word_groups={
            "bai3": ["百货", "百日", "百花", "百世", "百姓", "百家姓", "百里(姓)奚", 
                    "百分数", "百事通", "百川归海", "百里挑一", "百战百胜", "百花齐放",
                    "百依百顺", "百废待举", "千方百计", "百闻不如一见"]
        },
        famous_quotes=[
            {
                "quote": "江山代有才人出，各领风骚数百年。",
                "author": "清·赵翼",
                "source": "《论诗》"
            }
        ],
        character_structure={
            "base_char": "百",
            "related": [
                {"char": "佰", "pinyin": "bǎi", "meaning": "百的大写。(旧读bó，古时军队编制单位，百人为佰。)"},
                {"char": "陌", "pinyin": "mò", "meaning": "田间的小路。(南北方向的叫「阡」，东西方向的叫「陌」。)"},
                {"char": "貊", "pinyin": "mò", "meaning": "我国古代称东北方的民族。(本为兽名，大小如驴，形状似熊。)"}
            ]
        },
        meaning="十个十；泛指数目多"
    )
    
    print("✅ Sample data seeded successfully")


# ==================== Word Operations ====================

def add_word(word: str, pinyin: str = "", chinese_meaning: str = "", 
             english_translation: str = "", character_id: int = None,
             display: bool = False, is_ai_generated: bool = False) -> int:
    """Add a new word to the database"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO words (word, pinyin, chinese_meaning, english_translation, 
                              character_id, display, is_ai_generated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (word, pinyin, chinese_meaning, english_translation, 
              character_id, display, is_ai_generated))
        conn.commit()
        word_id = cursor.lastrowid
        return word_id
    except Exception as e:
        print(f"Error adding word: {e}")
        conn.rollback()
        return 0
    finally:
        conn.close()


def get_words_by_character(character_id: int) -> List[Dict]:
    """Get all words related to a character"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM words 
        WHERE character_id = ?
        ORDER BY created_at DESC
    """, (character_id,))
    rows = cursor.fetchall()
    conn.close()
    
    return [{
        'id': row['id'],
        'word': row['word'],
        'pinyin': row['pinyin'],
        'chinese_meaning': row['chinese_meaning'],
        'english_translation': row['english_translation'],
        'character_id': row['character_id'],
        'display': row['display'],
        'is_ai_generated': row['is_ai_generated'],
        'created_at': row['created_at']
    } for row in rows]


def get_all_words() -> List[Dict]:
    """Get all words (for word learning page)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT w.*, c.character as related_character
        FROM words w
        LEFT JOIN characters c ON w.character_id = c.id
        ORDER BY w.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    return [{
        'id': row['id'],
        'word': row['word'],
        'pinyin': row['pinyin'],
        'chinese_meaning': row['chinese_meaning'],
        'english_translation': row['english_translation'],
        'character_id': row['character_id'],
        'related_character': row['related_character'],
        'display': row['display'],
        'is_ai_generated': row['is_ai_generated'],
        'created_at': row['created_at']
    } for row in rows]


def update_word(word_id: int, updates: Dict) -> bool:
    """Update word information"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        allowed_fields = ['word', 'pinyin', 'chinese_meaning', 
                         'english_translation', 'display', 'is_ai_generated']
        
        set_clauses = []
        values = []
        
        for field in allowed_fields:
            if field in updates:
                set_clauses.append(f"{field} = ?")
                values.append(updates[field])
        
        if not set_clauses:
            return False
        
        values.append(word_id)
        
        cursor.execute(f"""
            UPDATE words 
            SET {', '.join(set_clauses)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, values)
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Error updating word: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


def delete_word(word_id: int) -> bool:
    """Delete a word"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM words WHERE id = ?", (word_id,))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error deleting word: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


def get_word_by_id(word_id: int) -> Optional[Dict]:
    """Get word by ID"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT w.*, c.character as related_character
        FROM words w
        LEFT JOIN characters c ON w.character_id = c.id
        WHERE w.id = ?
    """, (word_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'word': row['word'],
            'pinyin': row['pinyin'],
            'chinese_meaning': row['chinese_meaning'],
            'english_translation': row['english_translation'],
            'character_id': row['character_id'],
            'related_character': row['related_character'],
            'display': row['display'],
            'is_ai_generated': row['is_ai_generated'],
            'created_at': _format_datetime(row['created_at'])
        }
    return None


def get_word_by_text(word_text: str) -> Optional[Dict]:
    """Get word by word text"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT w.*, c.character as related_character
        FROM words w
        LEFT JOIN characters c ON w.character_id = c.id
        WHERE w.word = ?
    """, (word_text,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'word': row['word'],
            'pinyin': row['pinyin'],
            'chinese_meaning': row['chinese_meaning'],
            'english_translation': row['english_translation'],
            'character_id': row['character_id'],
            'related_character': row['related_character'],
            'display': row['display'],
            'is_ai_generated': row['is_ai_generated'],
            'created_at': row['created_at']
        }
    return None


# Initialize database on module import
init_db()

# Seed sample data if database is empty
if __name__ == "__main__":
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM characters")
    count = cursor.fetchone()['count']
    conn.close()
    
    if count == 0:
        seed_sample_data()


# ==================== User Management ====================

def get_all_users() -> List[Dict]:
    """Get all users"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, username, display_name, avatar, created_at
        FROM users
        ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    return [{
        'id': row['id'],
        'username': row['username'],
        'display_name': row['display_name'],
        'avatar': row['avatar'],
        'created_at': _format_datetime(row['created_at'])
    } for row in rows]


def get_user_by_id(user_id: int) -> Optional[Dict]:
    """Get user by ID"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, username, display_name, avatar, created_at
        FROM users WHERE id = ?
    """, (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'username': row['username'],
            'display_name': row['display_name'],
            'avatar': row['avatar'],
            'created_at': _format_datetime(row['created_at'])
        }
    return None


def create_user(username: str, display_name: str = None, avatar: str = None) -> int:
    """Create a new user"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO users (username, display_name, avatar)
            VALUES (?, ?, ?)
        """, (username, display_name or username, avatar))
        conn.commit()
        return cursor.lastrowid
    except sqlite3.IntegrityError:
        return 0
    finally:
        conn.close()


def update_user(user_id: int, display_name: str = None, avatar: str = None) -> bool:
    """Update user information"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        if display_name:
            cursor.execute("UPDATE users SET display_name = ? WHERE id = ?", (display_name, user_id))
        if avatar:
            cursor.execute("UPDATE users SET avatar = ? WHERE id = ?", (avatar, user_id))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error updating user: {e}")
        return False
    finally:
        conn.close()


def delete_user(user_id: int) -> bool:
    """Delete a user and all their progress"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error deleting user: {e}")
        return False
    finally:
        conn.close()


# ==================== User Learning Progress ====================

def get_user_character_progress(user_id: int) -> List[Dict]:
    """Get all character progress for a user"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT ucp.*, c.character, c.pinyin
        FROM user_character_progress ucp
        JOIN characters c ON ucp.character_id = c.id
        WHERE ucp.user_id = ?
        ORDER BY ucp.learned_date DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    return [{
        'id': row['id'],
        'character_id': row['character_id'],
        'character': row['character'],
        'pinyin': row['pinyin'],
        'learned_date': _format_datetime(row['learned_date']),
        'review_count': row['review_count'],
        'proficiency': row['proficiency'],
        'is_learned': row['is_learned']
    } for row in rows]


def update_user_character_progress(user_id: int, character_id: int, is_learned: bool = True, proficiency: int = None) -> bool:
    """Update user's progress on a character"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check if record exists
        cursor.execute("""
            SELECT id FROM user_character_progress 
            WHERE user_id = ? AND character_id = ?
        """, (user_id, character_id))
        row = cursor.fetchone()
        
        if row:
            # Update existing
            if proficiency is not None:
                cursor.execute("""
                    UPDATE user_character_progress 
                    SET is_learned = ?, proficiency = ?, review_count = review_count + 1,
                        last_reviewed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND character_id = ?
                """, (is_learned, proficiency, user_id, character_id))
            else:
                cursor.execute("""
                    UPDATE user_character_progress 
                    SET is_learned = ?, review_count = review_count + 1,
                        last_reviewed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND character_id = ?
                """, (is_learned, user_id, character_id))
        else:
            # Create new
            cursor.execute("""
                INSERT INTO user_character_progress 
                (user_id, character_id, is_learned, proficiency, learned_date)
                VALUES (?, ?, ?, ?, CURRENT_DATE)
            """, (user_id, character_id, is_learned, proficiency or 0))
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Error updating progress: {e}")
        return False
    finally:
        conn.close()


def get_user_learning_stats(user_id: int) -> Dict:
    """Get learning statistics for a user"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Total learned
    cursor.execute("""
        SELECT COUNT(*) FROM user_character_progress 
        WHERE user_id = ? AND is_learned = 1
    """, (user_id,))
    learned = cursor.fetchone()[0]
    
    # Total in progress
    cursor.execute("""
        SELECT COUNT(*) FROM user_character_progress 
        WHERE user_id = ? AND is_learned = 0
    """, (user_id,))
    in_progress = cursor.fetchone()[0]
    
    # Average proficiency
    cursor.execute("""
        SELECT AVG(proficiency) FROM user_character_progress 
        WHERE user_id = ?
    """, (user_id,))
    avg_proficiency = cursor.fetchone()[0] or 0
    
    # Recent activity (last 7 days)
    cursor.execute("""
        SELECT COUNT(*) FROM user_character_progress 
        WHERE user_id = ? AND learned_date >= DATE('now', '-7 days')
    """, (user_id,))
    recent = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        'learned': learned,
        'in_progress': in_progress,
        'average_proficiency': round(avg_proficiency, 1),
        'recent_activity': recent
    }

"""
Database Manager - PostgreSQL Primary (Neon)
All environments (local, mirror, production) use Neon PostgreSQL
"""
import os
import sqlite3
from pathlib import Path
from typing import Optional, Dict, Any

# Try to import psycopg2
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False

# Default Neon PostgreSQL URL - used by all environments
DEFAULT_NEON_URL = "postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Database configuration (legacy - for migration only)
DB_PATH = Path(__file__).parent / "data" / "chinese_learning.db"


def get_db_type() -> str:
    """Always use PostgreSQL as primary database"""
    # Always return postgresql - we use Neon for all environments
    return 'postgresql'


def get_postgres_url() -> Optional[str]:
    """Get PostgreSQL connection URL
    Priority:
    1. DATABASE_URL environment variable
    2. Settings file (for backward compatibility)
    3. Default Neon URL (fallback for all environments)
    """
    # Check environment variable first
    env_url = os.getenv('DATABASE_URL')
    if env_url:
        return env_url
    
    # Fall back to settings file
    try:
        from settings_manager import load_settings
        settings = load_settings()
        db_config = settings.get('database', {})
        url = db_config.get('postgresql_url')
        if url:
            return url
    except Exception:
        pass
    
    # Default to Neon PostgreSQL for all environments
    return DEFAULT_NEON_URL


class PostgresCursorWrapper:
    """Wrapper to convert SQLite-style ? placeholders to PostgreSQL %s"""
    def __init__(self, cursor):
        self.cursor = cursor
    
    def execute(self, query, params=None):
        # Convert ? to %s for PostgreSQL
        converted_query = query.replace('?', '%s')
        if params:
            return self.cursor.execute(converted_query, params)
        return self.cursor.execute(converted_query)
    
    def fetchone(self):
        return self.cursor.fetchone()
    
    def fetchall(self):
        return self.cursor.fetchall()
    
    def __getattr__(self, name):
        return getattr(self.cursor, name)


class PostgresConnectionWrapper:
    """Wrapper to return wrapped cursor"""
    def __init__(self, conn):
        self.conn = conn
    
    def cursor(self):
        return PostgresCursorWrapper(self.conn.cursor())
    
    def commit(self):
        return self.conn.commit()
    
    def rollback(self):
        return self.conn.rollback()
    
    def close(self):
        return self.conn.close()
    
    def __getattr__(self, name):
        return getattr(self.conn, name)


def get_db():
    """Get database connection (SQLite or PostgreSQL) - returns connection directly"""
    db_type = get_db_type()
    
    if db_type == 'postgresql':
        if not POSTGRES_AVAILABLE:
            raise RuntimeError("PostgreSQL support not available. Install psycopg2: pip install psycopg2-binary")
        
        url = get_postgres_url()
        if not url:
            raise RuntimeError("PostgreSQL URL not configured in settings")
        
        conn = psycopg2.connect(url)
        # Use RealDictCursor for dictionary-like access
        conn.cursor_factory = RealDictCursor
        return PostgresConnectionWrapper(conn)
    else:
        # SQLite
        DB_PATH.parent.mkdir(exist_ok=True)
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row
        return conn


def init_postgres_tables(cursor):
    """Initialize PostgreSQL tables"""
    # Characters table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS characters (
            id SERIAL PRIMARY KEY,
            character TEXT NOT NULL UNIQUE,
            pinyin TEXT,
            alt_pinyin TEXT,
            radical TEXT,
            stroke_count INTEGER,
            stroke_order TEXT,
            illustration_desc TEXT,
            illustration_image TEXT,
            rhyme_text TEXT,
            ancient_forms JSONB,
            etymology TEXT,
            word_groups JSONB,
            famous_quotes JSONB,
            character_structure JSONB,
            meaning TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Character progress
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS character_progress (
            id SERIAL PRIMARY KEY,
            character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
            learned_date DATE DEFAULT CURRENT_DATE,
            review_count INTEGER DEFAULT 0,
            last_reviewed TIMESTAMP,
            proficiency INTEGER DEFAULT 0
        )
    """)
    
    # Character schedule
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS character_schedule (
            id SERIAL PRIMARY KEY,
            character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
            scheduled_date DATE NOT NULL,
            is_learned BOOLEAN DEFAULT FALSE
        )
    """)
    
    # Words table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS words (
            id SERIAL PRIMARY KEY,
            word TEXT NOT NULL,
            pinyin TEXT,
            chinese_meaning TEXT,
            english_translation TEXT,
            example_sentence TEXT,
            character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
            display BOOLEAN DEFAULT FALSE,
            is_ai_generated BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            display_name TEXT,
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # User character progress
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_character_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
            learned_date DATE DEFAULT CURRENT_DATE,
            review_count INTEGER DEFAULT 0,
            last_reviewed TIMESTAMP,
            proficiency INTEGER DEFAULT 0,
            is_learned BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, character_id)
        )
    """)
    
    # Insert default user
    cursor.execute("""
        INSERT INTO users (id, username, display_name)
        VALUES (1, 'default', 'Default User')
        ON CONFLICT (id) DO NOTHING
    """)


def init_db():
    """Initialize database tables"""
    db_type = get_db_type()
    
    conn = get_db()
    cursor = conn.cursor()
    
    if db_type == 'postgresql':
        init_postgres_tables(cursor)
    else:
        # SQLite - use existing init code
        _init_sqlite_tables(cursor)
    
    conn.commit()
    conn.close()
    
    print(f"✅ Database initialized ({db_type})")


def _init_sqlite_tables(cursor):
    """Initialize SQLite tables (existing code)"""
    # Characters table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character TEXT NOT NULL UNIQUE,
            pinyin TEXT,
            alt_pinyin TEXT,
            radical TEXT,
            stroke_count INTEGER,
            stroke_order TEXT,
            illustration_desc TEXT,
            illustration_image TEXT,
            rhyme_text TEXT,
            ancient_forms TEXT,
            etymology TEXT,
            word_groups TEXT,
            famous_quotes TEXT,
            character_structure TEXT,
            meaning TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Character progress
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
    
    # Character schedule
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS character_schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            scheduled_date DATE NOT NULL,
            is_learned BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (character_id) REFERENCES characters(id)
        )
    """)
    
    # Words table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            pinyin TEXT,
            chinese_meaning TEXT,
            english_translation TEXT,
            example_sentence TEXT,
            character_id INTEGER,
            display BOOLEAN DEFAULT FALSE,
            is_ai_generated BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (character_id) REFERENCES characters(id)
        )
    """)
    
    # Users table
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
    
    # User character progress
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_character_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            character_id INTEGER NOT NULL,
            learned_date DATE DEFAULT CURRENT_DATE,
            review_count INTEGER DEFAULT 0,
            last_reviewed TIMESTAMP,
            proficiency INTEGER DEFAULT 0,
            is_learned BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (character_id) REFERENCES characters(id),
            UNIQUE(user_id, character_id)
        )
    """)
    
    # Insert default user
    cursor.execute("""
        INSERT OR IGNORE INTO users (id, username, display_name) 
        VALUES (1, 'default', 'Default User')
    """)

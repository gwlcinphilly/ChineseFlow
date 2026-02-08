"""
Migrate data from SQLite to PostgreSQL
"""
import sqlite3
import json
import sys
from pathlib import Path

# Try to import psycopg2
try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("Error: psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

# Paths
SQLITE_DB = Path(__file__).parent / "data" / "chinese_learning.db"
SETTINGS_FILE = Path(__file__).parent / "data" / "settings.json"

# Define which columns are boolean for each table
BOOLEAN_COLUMNS = {
    'words': ['display', 'is_ai_generated'],
    'character_schedule': ['is_learned'],
    'user_character_progress': ['is_learned'],
}


def get_postgres_url():
    """Get PostgreSQL URL from settings"""
    try:
        with open(SETTINGS_FILE, 'r') as f:
            settings = json.load(f)
            db_config = settings.get('database', {})
            return db_config.get('postgresql_url')
    except Exception as e:
        print(f"Error reading settings: {e}")
        return None


def migrate_table(sqlite_cursor, postgres_conn, table_name, columns):
    """Migrate a single table"""
    print(f"\nMigrating {table_name}...")
    
    # Get boolean columns for this table
    bool_cols = BOOLEAN_COLUMNS.get(table_name, [])
    
    # Get data from SQLite
    sqlite_cursor.execute(f"SELECT {', '.join(columns)} FROM {table_name}")
    rows = sqlite_cursor.fetchall()
    
    if not rows:
        print(f"  No data in {table_name}")
        return
    
    # Build INSERT query with proper PostgreSQL syntax
    placeholders = ', '.join(['%s'] * len(columns))
    columns_str = ', '.join(columns)
    
    count = 0
    skipped = 0
    for row in rows:
        postgres_cursor = postgres_conn.cursor()
        try:
            # Handle JSON and Boolean columns for PostgreSQL
            processed_row = []
            for i, val in enumerate(row):
                col_name = columns[i]
                
                if col_name in bool_cols and isinstance(val, int):
                    # Convert 0/1 to boolean
                    processed_row.append(bool(val))
                elif isinstance(val, str) and (val.startswith('{') or val.startswith('[')):
                    # Try to parse as JSON for PostgreSQL JSONB
                    try:
                        json.loads(val)  # Validate JSON
                        processed_row.append(val)  # Keep as string for JSONB
                    except:
                        processed_row.append(val)
                else:
                    processed_row.append(val)
            
            query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"
            postgres_cursor.execute(query, processed_row)
            postgres_conn.commit()
            count += 1
        except Exception as e:
            postgres_conn.rollback()
            skipped += 1
            if skipped <= 3:  # Only show first few errors
                print(f"  Skipped row: {e}")
        finally:
            postgres_cursor.close()
    
    print(f"  Migrated {count} rows" + (f" (skipped {skipped})" if skipped > 0 else ""))


def migrate():
    """Main migration function"""
    # Get PostgreSQL URL
    pg_url = get_postgres_url()
    if not pg_url:
        print("Error: PostgreSQL URL not found in settings.json")
        print("Please configure it in the Settings page first.")
        return False
    
    print(f"PostgreSQL URL found: {pg_url[:50]}...")
    
    # Connect to SQLite
    if not SQLITE_DB.exists():
        print(f"Error: SQLite database not found at {SQLITE_DB}")
        return False
    
    sqlite_conn = sqlite3.connect(str(SQLITE_DB))
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()
    
    # Connect to PostgreSQL
    try:
        pg_conn = psycopg2.connect(pg_url)
        print("Connected to PostgreSQL")
    except Exception as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return False
    
    # Clear existing data in PostgreSQL
    print("\nClearing existing data...")
    tables = ['user_character_progress', 'words', 'character_schedule', 'character_progress', 'characters', 'users']
    pg_cursor = pg_conn.cursor()
    for table in tables:
        try:
            pg_cursor.execute(f"DELETE FROM {table}")
            pg_conn.commit()
            print(f"  Cleared {table}")
        except Exception as e:
            pg_conn.rollback()
            pass  # Table might not exist
    pg_cursor.close()
    
    # Migrate tables
    try:
        # Characters
        migrate_table(sqlite_cursor, pg_conn, 'characters', [
            'id', 'character', 'pinyin', 'alt_pinyin', 'radical', 'stroke_count', 'stroke_order',
            'illustration_desc', 'illustration_image', 'rhyme_text', 'ancient_forms',
            'etymology', 'word_groups', 'famous_quotes', 'character_structure', 'meaning'
        ])
        
        # Users
        migrate_table(sqlite_cursor, pg_conn, 'users', [
            'id', 'username', 'display_name', 'avatar', 'created_at', 'updated_at'
        ])
        
        # Words
        migrate_table(sqlite_cursor, pg_conn, 'words', [
            'id', 'word', 'pinyin', 'chinese_meaning', 'english_translation',
            'character_id', 'display', 'is_ai_generated', 'created_at', 'updated_at'
        ])
        
        # Character progress
        migrate_table(sqlite_cursor, pg_conn, 'character_progress', [
            'id', 'character_id', 'learned_date', 'review_count', 'last_reviewed', 'proficiency'
        ])
        
        # Character schedule
        migrate_table(sqlite_cursor, pg_conn, 'character_schedule', [
            'id', 'character_id', 'scheduled_date', 'is_learned'
        ])
        
        # User character progress
        migrate_table(sqlite_cursor, pg_conn, 'user_character_progress', [
            'id', 'user_id', 'character_id', 'learned_date', 'review_count',
            'last_reviewed', 'proficiency', 'is_learned', 'created_at', 'updated_at'
        ])
        
        print("\n✅ Migration completed successfully!")
        print("\nNext steps:")
        print("1. Go to Settings page")
        print("2. Change Database Type to 'PostgreSQL' (if not already)")
        print("3. Save settings")
        print("4. Restart the backend")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        sqlite_conn.close()
        pg_conn.close()
    
    return True


if __name__ == "__main__":
    print("=" * 60)
    print("SQLite to PostgreSQL Migration Tool")
    print("=" * 60)
    print()
    
    # Auto-confirm if --force flag is passed
    if len(sys.argv) > 1 and sys.argv[1] == '--force':
        print("Auto-confirm enabled (--force)")
    
    success = migrate()
    sys.exit(0 if success else 1)

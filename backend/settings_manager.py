"""
Settings manager - save/load settings from JSON file
"""
import json
from pathlib import Path
from typing import Dict, Optional

SETTINGS_FILE = Path(__file__).parent / "data" / "settings.json"

DEFAULT_SETTINGS = {
    "provider": "kimi",
    "apiKey": "",  # User should fill this in
    "model": "kimi-latest",
    "database": {
        "type": "sqlite",  # sqlite or postgresql
        "postgresql_url": ""  # PostgreSQL connection URL
    }
}


def ensure_settings_file():
    """Create settings file if it doesn't exist"""
    SETTINGS_FILE.parent.mkdir(exist_ok=True)
    if not SETTINGS_FILE.exists():
        save_settings(DEFAULT_SETTINGS)
        print(f"✅ Created default settings file: {SETTINGS_FILE}")


def load_settings() -> Dict:
    """Load settings from JSON file"""
    ensure_settings_file()
    
    try:
        with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
            settings = json.load(f)
            # Merge with defaults to ensure all keys exist
            return {**DEFAULT_SETTINGS, **settings}
    except Exception as e:
        print(f"Error loading settings: {e}")
        return DEFAULT_SETTINGS.copy()


def save_settings(settings: Dict) -> bool:
    """Save settings to JSON file"""
    try:
        SETTINGS_FILE.parent.mkdir(exist_ok=True)
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving settings: {e}")
        return False


def update_settings(updates: Dict) -> Dict:
    """Update settings with new values"""
    current = load_settings()
    current.update(updates)
    save_settings(current)
    return current


# Initialize on module load
ensure_settings_file()

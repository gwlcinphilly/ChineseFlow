import type { 
  Article, ProgressSession, Word, 
  Character, CharacterListItem, LearningStats,
  AISettings, AIGenerateResponse, WordItem
} from './types';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  async getArticle(): Promise<Article> {
    const response = await fetch(`${API_BASE_URL}/article`);
    if (!response.ok) throw new Error('Failed to fetch article');
    return response.json();
  },

  async updateArticle(article: Article): Promise<Article> {
    const response = await fetch(`${API_BASE_URL}/article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    if (!response.ok) throw new Error('Failed to update article');
    return response.json();
  },

  async getWordInfo(word: string): Promise<Word> {
    const response = await fetch(`${API_BASE_URL}/word/${encodeURIComponent(word)}`);
    if (!response.ok) throw new Error('Failed to fetch word info');
    return response.json();
  },

  async saveProgress(session: ProgressSession): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    if (!response.ok) throw new Error('Failed to save progress');
  },

  async getProgress(): Promise<ProgressSession[]> {
    const response = await fetch(`${API_BASE_URL}/progress`);
    if (!response.ok) throw new Error('Failed to fetch progress');
    return response.json();
  },

  // ==================== Character Learning APIs ====================
  async addCharacter(character: Partial<Character>): Promise<{ id: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(character),
    });
    if (!response.ok) throw new Error('Failed to add character');
    return response.json();
  },

  async getAllCharacters(): Promise<CharacterListItem[]> {
    const response = await fetch(`${API_BASE_URL}/characters`);
    if (!response.ok) throw new Error('Failed to fetch characters');
    return response.json();
  },

  async getTodaysCharacters(): Promise<CharacterListItem[]> {
    const response = await fetch(`${API_BASE_URL}/characters/today`);
    if (!response.ok) throw new Error('Failed to fetch today\'s characters');
    return response.json();
  },

  async getCharacterDetails(character: string): Promise<Character> {
    const response = await fetch(`${API_BASE_URL}/characters/${encodeURIComponent(character)}`);
    if (!response.ok) throw new Error('Failed to fetch character details');
    return response.json();
  },

  async updateCharacterProgress(characterId: number, proficiency?: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proficiency }),
    });
    if (!response.ok) throw new Error('Failed to update character progress');
  },

  // ==================== Stats API ====================
  async getLearningStats(): Promise<LearningStats> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch learning stats');
    return response.json();
  },

  // ==================== Settings APIs ====================
  async getSettings(): Promise<AISettings> {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async saveSettings(settings: AISettings): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to save settings');
  },

  async testSettings(): Promise<{ valid: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/settings/test`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to test settings');
    return response.json();
  },

  // ==================== AI Generation APIs ====================
  async generateCharacterContent(character: string): Promise<AIGenerateResponse> {
    // Get settings from backend automatically
    const settings = await this.getSettings();
    
    const response = await fetch(`${API_BASE_URL}/ai/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character,
        provider: settings.provider,
        api_key: settings.apiKey,
        model: settings.model,
      }),
    });
    if (!response.ok) throw new Error('Failed to generate content');
    return response.json();
  },

  async generateCharacterImage(character: string, illustrationDesc: string): Promise<{ success: boolean; image_path?: string; error?: string }> {
    // Get settings from backend automatically
    const settings = await this.getSettings();
    
    const response = await fetch(`${API_BASE_URL}/ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character,
        illustration_desc: illustrationDesc,
        provider: settings.provider,
        api_key: settings.apiKey,
        model: settings.model,
      }),
    });
    if (!response.ok) throw new Error('Failed to generate image');
    return response.json();
  },

  async updateCharacterFull(characterId: number, data: Partial<Character>): Promise<{ id: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update character');
    return response.json();
  },

  // ==================== Word Management APIs ====================
  async addWord(word: Partial<WordItem>): Promise<{ id: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(word),
    });
    if (!response.ok) throw new Error('Failed to add word');
    return response.json();
  },

  async getAllWords(): Promise<WordItem[]> {
    const response = await fetch(`${API_BASE_URL}/words`);
    if (!response.ok) throw new Error('Failed to fetch words');
    return response.json();
  },

  async getWordsByCharacter(characterId: number): Promise<WordItem[]> {
    const response = await fetch(`${API_BASE_URL}/words/character/${characterId}`);
    if (!response.ok) throw new Error('Failed to fetch character words');
    return response.json();
  },

  async getWordById(wordId: number): Promise<WordItem> {
    const response = await fetch(`${API_BASE_URL}/words/${wordId}`);
    if (!response.ok) throw new Error('Failed to fetch word');
    return response.json();
  },

  async updateWord(wordId: number, updates: Partial<WordItem>): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/words/${wordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update word');
    return response.json();
  },

  async deleteWord(wordId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/words/${wordId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete word');
    return response.json();
  },

  async generateWordContent(wordId: number): Promise<{ message: string; data?: any }> {
    const response = await fetch(`${API_BASE_URL}/words/${wordId}/generate`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to generate word content');
    return response.json();
  },
};

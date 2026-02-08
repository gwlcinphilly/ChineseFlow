export interface Word {
  text: string;
  pinyin: string;
  translation?: string;
}

export interface Sentence {
  id: number;
  chinese: string;
  pinyin: string;
  translation: string;
  words: Word[];
}

export interface Article {
  title: string;
  level: string;
  sentences: Sentence[];
}

export interface ProgressSession {
  timestamp: string;
  duration_seconds: number;
  sentences_practiced: number;
}

// ==================== Traditional Character Card Format ====================

export interface FamousQuote {
  quote: string;
  author: string;
  source: string;
}

export interface RelatedChar {
  char: string;
  pinyin: string;
  meaning: string;
}

export interface CharacterStructure {
  base_char: string;
  related: RelatedChar[];
}

export interface Character {
  id: number;
  character: string;
  pinyin: string;
  alt_pinyin?: string;
  radical: string;
  stroke_count: number;
  stroke_order: string;
  
  // Left side content
  illustration_desc: string;
  illustration_image?: string;
  rhyme_text: string;
  
  // Right side content
  ancient_forms: Record<string, string>;  // bronze, seal, clerical, oracle
  etymology: string;
  
  // Bottom content
  word_groups: Record<string, string[]>;  // key: pinyin tone, value: words
  famous_quotes: FamousQuote[];
  character_structure: CharacterStructure;
  
  // Basic info
  meaning: string;
  created_at: string;
}

export interface CharacterListItem {
  id: number;
  character: string;
  pinyin: string;
  radical: string;
  stroke_count: number;
  scheduled_date?: string;
  is_learned?: boolean;
}

export interface WordItem {
  id: number;
  word: string;
  pinyin: string;
  chinese_meaning?: string;
  english_translation?: string;
  translation?: string;  // For backward compatibility
  example_sentence?: string;
  character_id?: number;
  related_character?: string;
  display?: boolean;
  is_ai_generated?: boolean;
  created_at: string;
}

export interface LearningStats {
  total_characters: number;
  today_characters: number;
  learned_characters: number;
  total_words?: number;
}

// ==================== AI Types ====================

export interface AISettings {
  provider: 'kimi' | 'openrouter' | 'openai' | 'siliconflow';
  apiKey: string;
  model: string;
}

export interface AIGeneratedContent {
  pinyin: string;
  alt_pinyin?: string;
  radical: string;
  stroke_count: number;
  stroke_order: string;
  illustration_desc: string;
  rhyme_text: string;
  ancient_forms: Record<string, string>;
  etymology: string;
  word_groups: Record<string, string[]>;
  famous_quotes: FamousQuote[];
  character_structure: CharacterStructure;
  meaning: string;
}

export interface AIGenerateResponse {
  success: boolean;
  data?: AIGeneratedContent;
  error?: string;
}

// ==================== User Types ====================

export interface User {
  id: number;
  username: string;
  display_name?: string;
  avatar?: string;
  created_at: string;
}

export interface UserProgress {
  id: number;
  character_id: number;
  character: string;
  pinyin: string;
  learned_date: string;
  review_count: number;
  proficiency: number;
  is_learned: boolean;
}

export interface UserStats {
  learned: number;
  in_progress: number;
  average_proficiency: number;
  recent_activity: number;
}

import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { WordDetailModal } from './WordDetailModal';
import type { Character, CharacterListItem, AISettings } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function CharacterLearning() {
  const [allCharacters, setAllCharacters] = useState<CharacterListItem[]>([]);
  const [learnedChars, setLearnedChars] = useState<any[]>([]);
  const [learnedSearch, setLearnedSearch] = useState('');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [isSelectedLearned, setIsSelectedLearned] = useState(false);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [charWords, setCharWords] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  
  // Word detail modal states
  const [wordDetailOpen, setWordDetailOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [showAddWordInput, setShowAddWordInput] = useState(false);
  const [newWordInput, setNewWordInput] = useState('');
  
  // Compute unlearned characters (生字表)
  const unlearnedCharacters = allCharacters.filter(
    char => !learnedChars.some((lc: any) => lc.character_id === char.id)
  );
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = parseInt(localStorage.getItem('currentUserId') || '1');
    setCurrentUserId(userId);
    loadCharacters();
    loadLearnedCharacters(userId);
    loadAISettings();
  }, []);

  const loadAISettings = async () => {
    try {
      const settings = await api.getSettings();
      setAiSettings(settings);
    } catch (err) {
      console.error('Failed to load AI settings:', err);
    }
  };

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await api.getTodaysCharacters();
      setAllCharacters(data);
      setError(null);
    } catch (err) {
      setError('加载生字失败');
    } finally {
      setLoading(false);
    }
  };

  const loadLearnedCharacters = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/progress`);
      const data = await response.json();
      // Filter only learned characters
      const learned = data.filter((p: any) => p.is_learned);
      setLearnedChars(learned);
    } catch (err) {
      console.error('Failed to load learned characters:', err);
    }
  };

  const handleAddCharacter = () => {
    const char = prompt('请输入一个汉字:');
    if (!char) return;
    
    const trimmed = char.trim()[0];
    if (!/[\u4e00-\u9fff]/.test(trimmed)) {
      alert('请输入有效的中文字符');
      return;
    }

    addCharacter(trimmed);
  };

  const addCharacter = async (char: string) => {
    try {
      setLoading(true);
      await api.addCharacter({ character: char, pinyin: '', meaning: '' });
      await loadCharacters();
    } catch (err) {
      alert('添加生字失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharacter = async (char: CharacterListItem) => {
    try {
      setLoading(true);
      const details = await api.getCharacterDetails(char.character);
      setSelectedChar(details);
      
      // Check if this character is learned by current user
      const isLearned = learnedChars.some((lc: any) => lc.character_id === char.id);
      setIsSelectedLearned(isLearned);
      
      // Load words for this character from words table
      const wordData = await api.getWordsByCharacter(char.id);
      setCharWords(wordData);
      contentRef.current?.scrollTo(0, 0);
    } catch (err) {
      setError('加载字符详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLearned = async () => {
    if (!selectedChar) return;
    try {
      if (isSelectedLearned) {
        // Relearn - mark as not learned
        await fetch(`${API_BASE_URL}/users/${currentUserId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character_id: selectedChar.id,
            is_learned: false
          })
        });
        setIsSelectedLearned(false);
      } else {
        // Mark as learned
        await fetch(`${API_BASE_URL}/users/${currentUserId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character_id: selectedChar.id,
            is_learned: true
          })
        });
        setIsSelectedLearned(true);
        setSelectedChar(null);
      }
      await loadCharacters();
      await loadLearnedCharacters(currentUserId);
    } catch (err) {
      console.error('Failed to toggle learned status:', err);
    }
  };

  const handleAIGenerate = async () => {
    if (!selectedChar) return;
    if (!aiSettings?.apiKey) {
      setAiError('请先配置 API Key');
      return;
    }
    try {
      setAiLoading(true);
      setAiError(null);
      const result = await api.generateCharacterContent(selectedChar.character);
      if (result.data) {
        await api.updateCharacterFull(selectedChar.id, result.data);
        await handleSelectCharacter({ id: selectedChar.id, character: selectedChar.character } as CharacterListItem);
      }
    } catch (err) {
      setAiError('生成失败: ' + (err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIGenerateImage = async () => {
    if (!selectedChar) return;
    try {
      setAiLoading(true);
      setAiError(null);
      const result = await api.generateCharacterImage(selectedChar.character, selectedChar.illustration_desc || '');
      if (result.success && result.image_path) {
        await api.updateCharacterFull(selectedChar.id, { illustration_image: result.image_path });
        await handleSelectCharacter({ id: selectedChar.id, character: selectedChar.character } as CharacterListItem);
      } else {
        setAiError(result.error || '图片生成失败');
      }
    } catch (err) {
      setAiError('图片生成出错: ' + (err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  // Word detail modal handlers
  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setWordDetailOpen(true);
  };

  const handleAddWordFromInput = () => {
    if (!newWordInput.trim()) {
      setShowAddWordInput(false);
      return;
    }
    const word = newWordInput.trim();
    if (!/[\u4e00-\u9fff]/.test(word)) {
      alert('请输入中文词语');
      return;
    }
    setNewWordInput('');
    setShowAddWordInput(false);
    handleWordClick(word);
  };

  // Parse word_groups from character data
  const getWordGroups = (char: Character) => {
    if (!char.word_groups) return [];
    try {
      const groups = typeof char.word_groups === 'string' ? JSON.parse(char.word_groups) : char.word_groups;
      return Object.entries(groups).flatMap(([tone, words]) => 
        (words as string[]).map((w: string) => ({ word: w, tone }))
      );
    } catch {
      return [];
    }
  };

  // Get image path
  const getImagePath = (char: Character) => {
    if (!char.illustration_image) return null;
    return char.illustration_image.replace('/frontend/public/', '/');
  };

  // Filter learned characters for display
  const filteredLearned = learnedChars.filter((c: any) => 
    c.character?.includes(learnedSearch) || 
    c.pinyin?.includes(learnedSearch)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
      {/* Left Sidebar */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Character List */}
        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title mb-0">生字表</h3>
            <div className="flex items-center gap-2">
              <span className="badge badge-secondary">{unlearnedCharacters.length} 个</span>
              <button 
                onClick={handleAddCharacter}
                className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center text-lg"
                title="添加生字"
              >
                +
              </button>
            </div>
          </div>
          
          {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
          
          {unlearnedCharacters.length === 0 ? (
            <div className="text-center py-4 text-stone-400">
              <p className="text-sm">还没有生字</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2 overflow-y-auto" style={{ maxHeight: '280px' }}>
              {unlearnedCharacters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`aspect-square flex items-center justify-center text-xl font-bold rounded-lg transition-all ${
                    selectedChar?.character === char.character
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-2 border-amber-400'
                      : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {char.character}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Learned Characters */}
        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title mb-0">认字表</h3>
            <span className="badge badge-secondary">{learnedChars.length} 个</span>
          </div>
          
          <input
            type="text"
            value={learnedSearch}
            onChange={(e) => setLearnedSearch(e.target.value)}
            placeholder="查找已学会的汉字..."
            className="input mb-3 text-sm"
          />
          
          {learnedChars.length === 0 ? (
            <div className="text-center py-4 text-stone-400">
              <p className="text-sm">还没有已学会的汉字</p>
            </div>
          ) : filteredLearned.length === 0 ? (
            <div className="text-center py-4 text-stone-400">
              <p className="text-sm">未找到匹配的汉字</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2 overflow-y-auto" style={{ maxHeight: '200px' }}>
              {filteredLearned.map((item: any) => (
                <button
                  key={item.character_id}
                  onClick={() => handleSelectCharacter({ 
                    id: item.character_id, 
                    character: item.character, 
                    pinyin: item.pinyin,
                    radical: '', 
                    stroke_count: 0 
                  })}
                  className={`aspect-square flex items-center justify-center text-xl font-bold rounded-lg transition-all ${
                    selectedChar?.character === item.character
                      ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 border-2 border-green-500'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100'
                  }`}
                >
                  {item.character}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Character Detail */}
      <div className="lg:col-span-9" ref={contentRef}>
        {selectedChar ? (
          <div className="card h-full flex flex-col animate-fade-in overflow-hidden">
            {/* Fixed Action Bar */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-stone-200 dark:border-stone-700 shrink-0">
              <button 
                onClick={handleToggleLearned} 
                className={`btn ${isSelectedLearned ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isSelectedLearned ? '↺ 再学学' : '✓ 学会了'}
              </button>
              
              {/* AI Operation Buttons Group */}
              <div className="flex gap-2 ml-auto">
                <button onClick={handleAIGenerate} disabled={aiLoading} className="btn btn-secondary">
                  <span className="mr-1">🤖</span> {aiLoading ? '生成中...' : '生成内容'}
                </button>
                <button onClick={handleAIGenerateImage} disabled={aiLoading} className="btn btn-secondary">
                  <span className="mr-1">🤖</span> {aiLoading ? '生成中...' : '生成图片'}
                </button>
              </div>
            </div>
            
            {aiError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg shrink-0">
                {aiError}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto mt-4 pr-2">
              {/* Character Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="char-display w-20 h-24 flex items-center justify-center text-5xl font-bold text-stone-800 dark:text-stone-100 flex-shrink-0">
                  {selectedChar.character}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-medium text-amber-600 dark:text-amber-400 mb-1">
                    {selectedChar.pinyin || '拼音'}
                    {selectedChar.alt_pinyin && <span className="text-base text-stone-400"> / {selectedChar.alt_pinyin}</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                    {selectedChar.radical && <span>部首: {selectedChar.radical}</span>}
                    {selectedChar.stroke_count && <span>笔画: {selectedChar.stroke_count}</span>}
                    {selectedChar.stroke_order && <span>笔顺: {selectedChar.stroke_order}</span>}
                  </div>
                </div>
              </div>

              {/* Illustration + Desc + Meaning Row */}
              <div className="flex gap-4 mb-6">
                {/* Illustration - always show placeholder */}
                <div className="w-32 h-32 flex-shrink-0 bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden flex items-center justify-center">
                  {getImagePath(selectedChar) ? (
                    <img 
                      src={getImagePath(selectedChar)!} 
                      alt={selectedChar.character}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-stone-300">🖼️</span>
                  )}
                </div>
                
                {/* Description and Meaning */}
                <div className="flex-1 flex flex-col justify-center">
                  {selectedChar.illustration_desc && (
                    <div className="mb-2">
                      <span className="text-xs text-stone-400">描述</span>
                      <p className="text-stone-700 dark:text-stone-300">{selectedChar.illustration_desc}</p>
                    </div>
                  )}
                  {selectedChar.meaning && (
                    <div>
                      <span className="text-xs text-stone-400">释义</span>
                      <p className="text-stone-700 dark:text-stone-300">{selectedChar.meaning}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Word Groups */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-medium text-stone-400">词语</h3>
                  <button
                    onClick={() => setShowAddWordInput(true)}
                    className="w-5 h-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center text-xs"
                    title="添加词语"
                  >
                    +
                  </button>
                </div>
                
                {showAddWordInput && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newWordInput}
                      onChange={(e) => setNewWordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddWordFromInput();
                        if (e.key === 'Escape') { setShowAddWordInput(false); setNewWordInput(''); }
                      }}
                      placeholder="输入词语..."
                      autoFocus
                      className="input flex-1 text-sm"
                    />
                    <button onClick={handleAddWordFromInput} className="btn btn-primary text-sm px-3">
                      添加
                    </button>
                  </div>
                )}
                
                {/* Combine word_groups and charWords */}
                {(() => {
                  const wordGroupWords = getWordGroups(selectedChar).map((w: any) => w.word);
                  const tableWords = charWords.map((w: any) => w.word);
                  const allWords = [...new Set([...wordGroupWords, ...tableWords])];
                  
                  return allWords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {allWords.map((word) => (
                        <button
                          key={word}
                          onClick={() => handleWordClick(word)}
                          className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors underline decoration-dotted"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-400 text-sm">暂无词语</p>
                  );
                })()}
              </div>

              {/* Etymology */}
              {selectedChar.etymology && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-stone-400 mb-2">字源</h3>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{selectedChar.etymology}</p>
                </div>
              )}

              {/* Rhyme */}
              {selectedChar.rhyme_text && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-stone-400 mb-2">顺口溜</h3>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-l-4 border-amber-400">
                    <p className="text-stone-700 dark:text-stone-300 whitespace-pre-line">{selectedChar.rhyme_text}</p>
                  </div>
                </div>
              )}

              {/* Famous Quotes */}
              {selectedChar.famous_quotes && (() => {
                try {
                  const quotes = typeof selectedChar.famous_quotes === 'string' 
                    ? JSON.parse(selectedChar.famous_quotes) 
                    : selectedChar.famous_quotes;
                  if (!Array.isArray(quotes) || quotes.length === 0) return null;
                  return (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-stone-400 mb-2">名句</h3>
                      <div className="space-y-3">
                        {quotes.map((q: any, idx: number) => (
                          <div key={idx} className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4">
                            <p className="text-stone-700 dark:text-stone-300 italic">"{q.quote}"</p>
                            <p className="text-sm text-stone-500 mt-1">— {q.author}《{q.source}》</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch {
                  return null;
                }
              })()}

              {/* Character Structure */}
              {selectedChar.character_structure && (() => {
                try {
                  const structure = typeof selectedChar.character_structure === 'string'
                    ? JSON.parse(selectedChar.character_structure)
                    : selectedChar.character_structure;
                  if (!structure?.related?.length) return null;
                  return (
                    <div>
                      <h3 className="text-sm font-medium text-stone-400 mb-2">构字</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-stone-500">基本字: <span className="font-bold text-lg">{structure.base_char}</span></p>
                        <div className="flex flex-wrap gap-2">
                          {structure.related.map((r: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
                              <span className="text-xl font-bold">{r.char}</span>
                              <span className="text-sm text-stone-500">{r.pinyin} · {r.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                } catch {
                  return null;
                }
              })()}
            </div>
          </div>
        ) : (
          <div className="card h-full flex items-center justify-center">
            <div className="text-center text-stone-400">
              <div className="text-4xl mb-2">📚</div>
              <p>从左侧选择一个生字开始学习</p>
            </div>
          </div>
        )}
        
        {/* Word Detail Modal */}
        <WordDetailModal
          isOpen={wordDetailOpen}
          onClose={() => setWordDetailOpen(false)}
          word={selectedWord}
          characterId={selectedChar?.id}
          onWordAdded={async () => {
            // Refresh words for current character
            if (selectedChar) {
              const wordData = await api.getWordsByCharacter(selectedChar.id);
              setCharWords(wordData);
            }
          }}
        />
      </div>
    </div>
  );
}

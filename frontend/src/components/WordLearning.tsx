import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { CharacterDetailModal } from './CharacterDetailModal';
import type { WordItem } from '../types';

export function WordLearning() {
  const [words, setWords] = useState<WordItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  
  // Character detail modal
  const [charModalOpen, setCharModalOpen] = useState(false);
  const [selectedCharForModal, setSelectedCharForModal] = useState('');
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      const data = await api.getAllWords();
      setWords(data);
    } catch (err) {
      console.error('Failed to load words:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      setShowAddInput(false);
      return;
    }
    if (!/[\u4e00-\u9fff]/.test(newWord)) {
      alert('请输入包含中文的词语');
      return;
    }

    try {
      setLoading(true);
      await api.addWord({ 
        word: newWord.trim(), 
        translation: newTranslation.trim(),
        display: true 
      });
      setNewWord('');
      setNewTranslation('');
      setShowAddInput(false);
      await loadWords();
    } catch (err) {
      alert('添加词语失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWord = async (word: WordItem) => {
    try {
      setLoading(true);
      const details = await api.getWordById(word.id);
      setSelectedWord(details);
      contentRef.current?.scrollTo(0, 0);
    } catch (err) {
      setSelectedWord(word);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
      {/* Left Content - Word Detail */}
      <div className="lg:col-span-9 order-2 lg:order-1" ref={contentRef}>
        {selectedWord ? (
          <div className="card h-full flex flex-col animate-fade-in overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2">
              {/* Word Header */}
              <div className="flex items-start gap-6 mb-6">
                <div className="char-display w-24 h-28 flex flex-col items-center justify-center text-stone-800 dark:text-stone-100 flex-shrink-0">
                  <span className="text-5xl font-bold">{selectedWord.word}</span>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-medium text-amber-600 dark:text-amber-400 mb-2">
                    {selectedWord.pinyin || '拼音'}
                  </div>
                  {selectedWord.translation && (
                    <div className="text-stone-600 dark:text-stone-400">
                      {selectedWord.translation}
                    </div>
                  )}
                  
                  {/* Source Character */}
                  {selectedWord.related_character && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-stone-400">来源:</span>
                      <button
                        onClick={() => {
                          setSelectedCharForModal(selectedWord.related_character!);
                          setCharModalOpen(true);
                        }}
                        className="px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded text-stone-700 dark:text-stone-300 text-sm font-bold transition-colors"
                      >
                        {selectedWord.related_character}
                      </button>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleSpeak(selectedWord.word)}
                    className="mt-3 btn btn-secondary text-sm"
                  >
                    🔊 朗读
                  </button>
                </div>
              </div>

              {/* Chinese Meaning */}
              {selectedWord.chinese_meaning && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-stone-400 mb-2">中文解释</h3>
                  <p className="text-stone-700 dark:text-stone-300">{selectedWord.chinese_meaning}</p>
                </div>
              )}

              {/* English Translation */}
              {selectedWord.english_translation && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-stone-400 mb-2">English</h3>
                  <p className="text-stone-700 dark:text-stone-300">{selectedWord.english_translation}</p>
                </div>
              )}

              {/* Example Sentence */}
              {selectedWord.example_sentence && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-stone-400 mb-2">例句</h3>
                  <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4">
                    <p className="text-lg text-stone-800 dark:text-stone-100 mb-2">{selectedWord.example_sentence}</p>
                    <button 
                      onClick={() => handleSpeak(selectedWord.example_sentence!)}
                      className="text-sm text-amber-600 hover:text-amber-700"
                    >
                      🔊 朗读例句
                    </button>
                  </div>
                </div>
              )}

              {/* Character Breakdown */}
              <div>
                <h3 className="text-sm font-medium text-stone-400 mb-2">字词分析</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWord.word.split('').map((char, idx) => (
                    <button
                      key={idx}
                      onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-character', { detail: char }))}
                      className="w-14 h-14 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 flex items-center justify-center text-xl font-bold text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card h-full flex items-center justify-center">
            <div className="text-center text-stone-400">
              <div className="text-4xl mb-2">📚</div>
              <p>从右侧选择一个词语开始学习</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Word List */}
      <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col">
        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">词语表</h3>
            <div className="flex items-center gap-2">
              <span className="badge badge-secondary">{words.length} 个</span>
              <button 
                onClick={() => setShowAddInput(true)}
                className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center text-lg"
                title="添加词语"
              >
                +
              </button>
            </div>
          </div>
          
          {showAddInput && (
            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddWord();
                  if (e.key === 'Escape') { setShowAddInput(false); setNewWord(''); setNewTranslation(''); }
                }}
                placeholder="中文词语..."
                autoFocus
                className="input text-sm"
              />
              <input
                type="text"
                value={newTranslation}
                onChange={(e) => setNewTranslation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                placeholder="英文翻译 (可选)..."
                className="input text-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleAddWord} disabled={loading} className="btn btn-primary text-sm flex-1">
                  {loading ? '添加中...' : '添加'}
                </button>
                <button 
                  onClick={() => { setShowAddInput(false); setNewWord(''); setNewTranslation(''); }}
                  className="btn btn-secondary text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          )}
          
          {words.length === 0 ? (
            <div className="text-center py-8 text-stone-400 flex-1">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm">还没有词语</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 overflow-y-auto" style={{ maxHeight: '500px' }}>
              {words.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleSelectWord(word)}
                  className={`p-2 rounded-lg transition-all duration-200 text-center ${
                    selectedWord?.id === word.id
                      ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400'
                      : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <span className={`font-bold text-base block truncate ${
                    selectedWord?.id === word.id
                      ? 'text-amber-800 dark:text-amber-200'
                      : 'text-stone-800 dark:text-stone-100'
                  }`}>
                    {word.word}
                  </span>
                  {word.pinyin && (
                    <span className={`text-xs block truncate ${
                      selectedWord?.id === word.id
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-stone-400'
                    }`}>
                      {word.pinyin}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Character Detail Modal */}
      <CharacterDetailModal
        isOpen={charModalOpen}
        onClose={() => setCharModalOpen(false)}
        character={selectedCharForModal}
      />
    </div>
  );
}

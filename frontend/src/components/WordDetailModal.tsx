import { useState, useEffect } from 'react';

interface WordDetail {
  word: string;
  pinyin: string;
  english_translation?: string;
  example_sentence?: string;
  example_pinyin?: string;
  example_translation?: string;
}

interface WordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  characterId?: number;
  onWordAdded?: () => void;
}

export function WordDetailModal({ isOpen, onClose, word, characterId, onWordAdded }: WordDetailModalProps) {
  const [wordDetail, setWordDetail] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (isOpen && word) {
      // Try to find existing word details from API
      loadWordDetail();
      setAdded(false);
    }
  }, [isOpen, word]);

  const loadWordDetail = async () => {
    if (!word) return;
    
    setLoading(true);
    try {
      // First try to get from existing words table
      const response = await fetch(`${API_BASE_URL}/words/search/${encodeURIComponent(word)}`);
      if (response.ok) {
        const data = await response.json();
        setWordDetail({
          word: data.word || word,
          pinyin: data.pinyin || '',
          english_translation: data.english_translation || data.translation || '',
          example_sentence: data.example_sentence || '',
        });
      } else {
        // Use default with just the word
        setWordDetail({
          word: word,
          pinyin: '',
          english_translation: '',
          example_sentence: '',
        });
      }
    } catch (err) {
      // Use default
      setWordDetail({
        word: word,
        pinyin: '',
        english_translation: '',
        example_sentence: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!wordDetail) return;
    
    // For now, just show placeholder data
    setWordDetail({
      ...wordDetail,
      pinyin: wordDetail.pinyin || '拼音待添加',
      english_translation: wordDetail.english_translation || 'English translation pending',
      example_sentence: wordDetail.example_sentence || '例句待添加',
      example_pinyin: 'lì jù dài tiān jiā',
      example_translation: 'Example sentence pending',
    });
    alert('AI 功能需要配置 API Key');
  };

  const handleAddToWordList = async () => {
    if (!wordDetail) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: wordDetail.word,
          pinyin: wordDetail.pinyin,
          english_translation: wordDetail.english_translation,
          example_sentence: wordDetail.example_sentence,
          character_id: characterId,
          display: true, // Add to word learning page
        }),
      });
      
      if (response.ok) {
        setAdded(true);
        onWordAdded?.();
      } else {
        alert('添加失败，词语可能已存在');
      }
    } catch (err) {
      alert('添加失败');
    }
  };

  if (!isOpen || !wordDetail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">
            词语详情
          </h3>
          <button onClick={onClose} className="text-2xl text-stone-400 hover:text-stone-600">&times;</button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-stone-500">加载中...</div>
        ) : (
          <div className="space-y-6">
            {/* Word and Pinyin */}
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                {wordDetail.word}
              </div>
              <div className="text-xl text-amber-600 dark:text-amber-400">
                {wordDetail.pinyin || '拼音未生成'}
              </div>
            </div>

            {/* English Translation */}
            {wordDetail.english_translation && (
              <div>
                <h4 className="text-sm font-medium text-stone-400 mb-2">英文翻译</h4>
                <p className="text-stone-700 dark:text-stone-300 text-lg">
                  {wordDetail.english_translation}
                </p>
              </div>
            )}

            {/* Example Sentence */}
            {(wordDetail.example_sentence || wordDetail.example_pinyin) && (
              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4">
                <h4 className="text-sm font-medium text-stone-400 mb-3">造句</h4>
                {wordDetail.example_sentence && (
                  <p className="text-lg text-stone-800 dark:text-stone-100 mb-2">
                    {wordDetail.example_sentence}
                  </p>
                )}
                {wordDetail.example_pinyin && (
                  <p className="text-amber-600 dark:text-amber-400 mb-2">
                    {wordDetail.example_pinyin}
                  </p>
                )}
                {wordDetail.example_translation && (
                  <p className="text-stone-500 text-sm italic">
                    {wordDetail.example_translation}
                  </p>
                )}
              </div>
            )}

            {/* AI Generate Button */}
            {(!wordDetail.pinyin || !wordDetail.english_translation) && (
              <button
                onClick={handleAIGenerate}
                className="w-full btn btn-secondary"
              >
                <span className="mr-1">🤖</span> 生成详情
              </button>
            )}

            {/* Add to Word List Button */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
              <button
                onClick={handleAddToWordList}
                disabled={added}
                className={`w-full btn ${added ? 'bg-green-500 text-white' : 'btn-primary'}`}
              >
                {added ? '✓ 已加到认词页' : '➕ 加到认词页'}
              </button>
            </div>

            {/* Close Button */}
            <button onClick={onClose} className="w-full btn btn-secondary">
              关闭
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

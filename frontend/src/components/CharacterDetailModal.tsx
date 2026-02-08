import { useState, useEffect } from 'react';
import { api } from '../api';
import type { Character } from '../types';

interface CharacterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: string;
}

export function CharacterDetailModal({ isOpen, onClose, character }: CharacterDetailModalProps) {
  const [charDetail, setCharDetail] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && character) {
      loadCharacterDetail();
    }
  }, [isOpen, character]);

  const loadCharacterDetail = async () => {
    try {
      setLoading(true);
      const details = await api.getCharacterDetails(character);
      setCharDetail(details);
    } catch (err) {
      console.error('Failed to load character:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImagePath = (char: Character) => {
    if (!char.illustration_image) return null;
    return char.illustration_image.replace('/frontend/public/', '/');
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">汉字详情</h3>
          <button onClick={onClose} className="text-2xl text-stone-400 hover:text-stone-600">&times;</button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-stone-500">加载中...</div>
        ) : charDetail ? (
          <div className="space-y-4">
            {/* Character Header */}
            <div className="flex items-start gap-4">
              <div className="char-display w-20 h-24 flex items-center justify-center text-5xl font-bold text-stone-800 dark:text-stone-100 flex-shrink-0">
                {charDetail.character}
              </div>
              <div className="flex-1">
                <div className="text-xl font-medium text-amber-600 dark:text-amber-400 mb-1">
                  {charDetail.pinyin || '拼音'}
                  {charDetail.alt_pinyin && <span className="text-base text-stone-400"> / {charDetail.alt_pinyin}</span>}
                </div>
                <div className="text-stone-600 dark:text-stone-400 text-sm">
                  {charDetail.meaning || '暂无释义'}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-stone-500">
                  {charDetail.radical && <span>部首: {charDetail.radical}</span>}
                  {charDetail.stroke_count && <span>笔画: {charDetail.stroke_count}</span>}
                  {charDetail.stroke_order && <span>笔顺: {charDetail.stroke_order}</span>}
                </div>
                <button 
                  onClick={() => handleSpeak(charDetail.character)}
                  className="mt-2 btn btn-secondary text-xs px-3 py-1.5"
                >
                  🔊 朗读
                </button>
              </div>
            </div>

            {/* Illustration */}
            {(charDetail.illustration_image || charDetail.illustration_desc) && (
              <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                {getImagePath(charDetail) ? (
                  <img 
                    src={getImagePath(charDetail)!} 
                    alt={charDetail.character}
                    className="max-w-full h-auto max-h-32 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 mx-auto bg-stone-200 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                    <span className="text-3xl text-stone-400">🖼️</span>
                  </div>
                )}
                {charDetail.illustration_desc && (
                  <p className="text-xs text-stone-500 mt-2 text-center">{charDetail.illustration_desc}</p>
                )}
              </div>
            )}

            {/* Etymology */}
            {charDetail.etymology && (
              <div>
                <h4 className="text-xs font-medium text-stone-400 mb-1">字源</h4>
                <p className="text-sm text-stone-700 dark:text-stone-300">{charDetail.etymology}</p>
              </div>
            )}

            {/* Rhyme */}
            {charDetail.rhyme_text && (
              <div>
                <h4 className="text-xs font-medium text-stone-400 mb-1">顺口溜</h4>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border-l-2 border-amber-400">
                  <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line">{charDetail.rhyme_text}</p>
                </div>
              </div>
            )}

            {/* Word Groups */}
            {charDetail.word_groups && (() => {
              try {
                const groups = typeof charDetail.word_groups === 'string' 
                  ? JSON.parse(charDetail.word_groups) 
                  : charDetail.word_groups;
                const words = Object.entries(groups).flatMap(([_, w]) => w as string[]);
                if (words.length === 0) return null;
                return (
                  <div>
                    <h4 className="text-xs font-medium text-stone-400 mb-1">词语</h4>
                    <div className="flex flex-wrap gap-1">
                      {words.slice(0, 8).map((w: string) => (
                        <span key={w} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded text-xs">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })()}

            {/* Close Button */}
            <button onClick={onClose} className="w-full btn btn-secondary mt-4">
              关闭
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-stone-400">
            <p>未找到汉字信息</p>
          </div>
        )}
      </div>
    </div>
  );
}

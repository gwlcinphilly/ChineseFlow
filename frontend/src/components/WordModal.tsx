import { useState, useEffect } from 'react';
import { api } from '../api';
import type { WordItem } from '../types';

interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: WordItem | null;
  characterId: number | null;
  character: string;
  onSave: () => void;
}

export function WordModal({ isOpen, onClose, word, characterId, character, onSave }: WordModalProps) {
  const [formData, setFormData] = useState({
    word: '',
    pinyin: '',
    chinese_meaning: '',
    english_translation: '',
    display: false,
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (word) {
      setFormData({
        word: word.word || '',
        pinyin: word.pinyin || '',
        chinese_meaning: word.chinese_meaning || '',
        english_translation: word.english_translation || '',
        display: word.display || false,
      });
    } else {
      setFormData({
        word: '',
        pinyin: '',
        chinese_meaning: '',
        english_translation: '',
        display: false,
      });
    }
  }, [word, isOpen]);

  const handleSubmit = async () => {
    if (!formData.word.trim()) return;
    
    try {
      setLoading(true);
      if (word?.id) {
        await api.updateWord(word.id, formData);
      } else {
        await api.addWord({
          ...formData,
          character_id: characterId || undefined,
        });
      }
      onSave();
      onClose();
    } catch (err) {
      alert('保存失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!word?.id) {
      alert('请先保存词语，再使用AI生成内容');
      return;
    }
    
    try {
      setAiLoading(true);
      const result = await api.generateWordContent(word.id);
      if (result.data) {
        setFormData(prev => ({
          ...prev,
          pinyin: result.data.pinyin || prev.pinyin,
          chinese_meaning: result.data.chinese_meaning || prev.chinese_meaning,
          english_translation: result.data.english_translation || prev.english_translation,
        }));
        alert('AI 生成成功！');
      }
    } catch (err) {
      alert('AI 生成失败: ' + (err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {word ? '编辑词语' : '添加词语'}
            <span className="ml-2 text-sm font-normal text-stone-500">(字: {character})</span>
          </h3>
          <button onClick={onClose} className="text-2xl text-stone-400 hover:text-stone-600">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">词语</label>
            <input
              type="text"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              className="input"
              placeholder="输入词语..."
              disabled={!!word?.id}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">拼音</label>
            <input
              type="text"
              value={formData.pinyin}
              onChange={(e) => setFormData({ ...formData, pinyin: e.target.value })}
              className="input"
              placeholder="pinyin with tone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">中文解释</label>
            <textarea
              value={formData.chinese_meaning}
              onChange={(e) => setFormData({ ...formData, chinese_meaning: e.target.value })}
              className="input resize-none"
              placeholder="中文详细解释..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">英文翻译</label>
            <textarea
              value={formData.english_translation}
              onChange={(e) => setFormData({ ...formData, english_translation: e.target.value })}
              className="input resize-none"
              placeholder="English translation..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
            <input
              type="checkbox"
              id="display"
              checked={formData.display}
              onChange={(e) => setFormData({ ...formData, display: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="display" className="text-sm">在认词页面显示此词语</label>
          </div>

          {word?.id && (
            <button
              onClick={handleAIGenerate}
              disabled={aiLoading}
              className="w-full btn btn-secondary"
            >
              {aiLoading ? '🤖 生成中...' : '🤖 AI 生成内容'}
            </button>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.word.trim()}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

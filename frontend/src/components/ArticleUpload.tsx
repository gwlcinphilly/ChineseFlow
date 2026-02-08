import React, { useState } from 'react';
import { api } from '../api';
import type { Article } from '../types';

interface ArticleUploadProps {
  onArticleUploaded: () => void;
}

interface SentenceInput {
  chinese: string;
  translation: string;
}

export const ArticleUpload: React.FC<ArticleUploadProps> = ({ onArticleUploaded }) => {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [sentences, setSentences] = useState<SentenceInput[]>([
    { chinese: '', translation: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addSentence = () => {
    setSentences([...sentences, { chinese: '', translation: '' }]);
  };

  const removeSentence = (index: number) => {
    if (sentences.length > 1) {
      setSentences(sentences.filter((_, i) => i !== index));
    }
  };

  const updateSentence = (index: number, field: 'chinese' | 'translation', value: string) => {
    const newSentences = [...sentences];
    newSentences[index][field] = value;
    setSentences(newSentences);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim()) {
      setError('请输入标题');
      return;
    }

    const validSentences = sentences.filter(s => s.chinese.trim() && s.translation.trim());
    if (validSentences.length === 0) {
      setError('请至少添加一句包含中文文本和翻译的内容');
      return;
    }

    try {
      setLoading(true);

      const article: Article = {
        title: title.trim(),
        level,
        sentences: validSentences.map((s, index) => ({
          id: index + 1,
          chinese: s.chinese.trim(),
          pinyin: '',
          translation: s.translation.trim(),
          words: []
        }))
      };

      await api.updateArticle(article);
      
      setSuccess(true);
      setError(null);
      
      setTitle('');
      setSentences([{ chinese: '', translation: '' }]);
      
      setTimeout(() => {
        onArticleUploaded();
      }, 1500);

    } catch (err) {
      console.error('Upload error:', err);
      setError('上传文章失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const lines = text.split('\n').filter(line => line.trim());
      
      const newSentences: SentenceInput[] = [];
      
      for (const line of lines) {
        if (line.trim()) {
          if (/[\u4e00-\u9fa5]/.test(line)) {
            newSentences.push({ chinese: line.trim(), translation: '' });
          }
        }
      }

      if (newSentences.length > 0) {
        setSentences(newSentences);
      } else {
        setError('剪贴板中未找到中文文本');
      }
    } catch (err) {
      setError('无法读取剪贴板，请手动粘贴。');
    }
  };

  const levelLabels: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  };

  return (
    <div className="glass-card max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="text-3xl">📝</span>
          上传新文章
        </h2>
        <p className="text-surface-500 dark:text-surface-400">
          添加你自己的中文文章，系统将自动生成拼音和词汇分解。
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 flex items-center gap-2">
          <span className="text-xl">✅</span>
          文章上传成功！正在跳转阅读...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-surface-700 dark:text-surface-300">
            文章标题 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：我的家人"
            className="input-modern chinese-text"
            disabled={loading}
          />
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-surface-700 dark:text-surface-300">
            难度级别
          </label>
          <div className="flex gap-3">
            {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevel(lvl)}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  level === lvl
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
                disabled={loading}
              >
                {levelLabels[lvl]}
              </button>
            ))}
          </div>
        </div>

        {/* Paste from Clipboard */}
        <div>
          <button
            type="button"
            onClick={pasteFromClipboard}
            className="btn btn-secondary text-sm"
            disabled={loading}
          >
            <span className="mr-2">📋</span>
            从剪贴板粘贴中文文本
          </button>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
            复制多句中文，一次性粘贴
          </p>
        </div>

        {/* Sentences */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
              句子 *（至少1句）
            </label>
            <button
              type="button"
              onClick={addSentence}
              className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center gap-1 transition-colors"
              disabled={loading}
            >
              <span>+</span>
              添加句子
            </button>
          </div>

          <div className="space-y-4">
            {sentences.map((sentence, index) => (
              <div 
                key={index} 
                className="p-5 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-surface-600 dark:text-surface-400">
                    第 {index + 1} 句
                  </span>
                  {sentences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSentence(index)}
                      className="text-red-400 hover:text-red-500 text-sm font-medium transition-colors"
                      disabled={loading}
                    >
                      ✕ 删除
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-surface-500 dark:text-surface-500 mb-1">
                      中文文本 *
                    </label>
                    <textarea
                      value={sentence.chinese}
                      onChange={(e) => updateSentence(index, 'chinese', e.target.value)}
                      placeholder="例如：我家有四口人：爸爸、妈妈、哥哥和我。"
                      rows={2}
                      className="input-modern chinese-text text-lg"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-surface-500 dark:text-surface-500 mb-1">
                      英文翻译 *
                    </label>
                    <textarea
                      value={sentence.translation}
                      onChange={(e) => updateSentence(index, 'translation', e.target.value)}
                      placeholder="例如：There are four people in my family: dad, mom, older brother, and me."
                      rows={2}
                      className="input-modern"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 text-sm text-surface-600 dark:text-surface-400">
          <p className="font-semibold mb-2 text-surface-700 dark:text-surface-300">💡 工作原理：</p>
          <ul className="space-y-1 ml-4">
            <li>• 为每句输入中文文本和英文翻译</li>
            <li>• 拼音将自动生成</li>
            <li>• 词汇将自动分词并添加释义</li>
            <li>• 新文章将替换当前文章</li>
          </ul>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner mr-2 w-4 h-4 border-2" />
                处理中...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                上传文章
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

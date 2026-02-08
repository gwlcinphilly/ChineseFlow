import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ArticleReader } from './components/ArticleReader';
import { ProgressTracker } from './components/ProgressTracker';
import { Quiz } from './components/Quiz';
import { ArticleUpload } from './components/ArticleUpload';
import { CharacterLearning } from './components/CharacterLearning';
import { WordLearning } from './components/WordLearning';
import { Settings } from './components/Settings';
import { api } from './api';
import type { Article } from './types';

function App() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'characters' | 'words' | 'read' | 'quiz' | 'progress' | 'upload' | 'settings'>('characters');
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    loadArticle();

    return () => {
      if (article) {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
        if (duration > 10) {
          api.saveProgress({
            timestamp: new Date().toISOString(),
            duration_seconds: duration,
            sentences_practiced: article.sentences.length,
          }).catch(console.error);
        }
      }
    };
  }, []);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await api.getArticle();
      setArticle(data);
      setError(null);
    } catch (err) {
      setError('加载文章失败，请确保后端服务正在运行。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleUploaded = () => {
    loadArticle();
    setActiveTab('read');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-xl text-white mx-auto mb-3 animate-pulse">
            汉
          </div>
          <p className="text-stone-500">正在加载...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50 dark:bg-stone-950">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-lg font-semibold mb-2">连接错误</h2>
          <p className="text-stone-500 mb-4">{error}</p>
          <button onClick={loadArticle} className="btn btn-primary">
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50 dark:bg-stone-950">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl mx-auto mb-4">
            📖
          </div>
          <h2 className="text-lg font-semibold mb-2">未找到文章</h2>
          <p className="text-stone-500 mb-4">添加一篇文章开始学习吧！</p>
          <button onClick={() => setActiveTab('upload')} className="btn btn-primary">
            去上传文章
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'characters', label: '识字' },
    { id: 'words', label: '认词' },
    { id: 'read', label: '阅读' },
    { id: 'upload', label: '上传' },
    { id: 'quiz', label: '测验' },
    { id: 'progress', label: '进度' },
    { id: 'settings', label: '设置' },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      <Header />

      {/* Navigation */}
      <nav className="fixed top-14 left-0 right-0 z-40 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab whitespace-nowrap ${activeTab === tab.id ? 'nav-tab-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-28 pb-8">
        <div className="animate-fade-in">
          {activeTab === 'characters' && <CharacterLearning />}
          {activeTab === 'words' && <WordLearning />}
          {activeTab === 'read' && <ArticleReader article={article} />}
          {activeTab === 'upload' && <ArticleUpload onArticleUploaded={handleArticleUploaded} />}
          {activeTab === 'quiz' && <Quiz article={article} />}
          {activeTab === 'progress' && <ProgressTracker />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-stone-500">
          ChineseFlow · 互动式中文学习平台
        </div>
      </footer>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { api } from '../api';
import type { ProgressSession } from '../types';

export const ProgressTracker: React.FC = () => {
  const [sessions, setSessions] = useState<ProgressSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await api.getProgress();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60;
  const totalSentences = sessions.reduce((sum, s) => sum + s.sentences_practiced, 0);

  if (loading) {
    return (
      <div className="glass-card">
        <div className="flex items-center justify-center py-12">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        学习进度
      </h3>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-surface-500 dark:text-surface-400">
            暂无练习记录，开始朗读以追踪学习进度！
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="text-3xl font-bold gradient-text">
                {sessions.length}
              </div>
              <div className="text-xs text-surface-500 dark:text-surface-400 mt-1">练习次数</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold gradient-text">
                {Math.round(totalMinutes)}
              </div>
              <div className="text-xs text-surface-500 dark:text-surface-400 mt-1">学习时长(分)</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold gradient-text">
                {totalSentences}
              </div>
              <div className="text-xs text-surface-500 dark:text-surface-400 mt-1">练习句子数</div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="pt-4 border-t border-surface-200 dark:border-surface-800">
            <h4 className="text-sm font-semibold mb-3 text-surface-700 dark:text-surface-300">最近练习</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.slice(-5).reverse().map((session, index) => (
                <div 
                  key={index} 
                  className="text-sm flex justify-between items-center bg-surface-50 dark:bg-surface-900/50 p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <span className="text-surface-500 dark:text-surface-400">
                    {new Date(session.timestamp).toLocaleDateString('zh-CN')}
                  </span>
                  <span className="font-medium text-surface-700 dark:text-surface-200">
                    {Math.round(session.duration_seconds / 60)} 分钟
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

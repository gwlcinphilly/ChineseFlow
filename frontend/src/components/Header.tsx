import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  display_name?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const Header: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const userId = localStorage.getItem('currentUserId') || '1';
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Failed to load current user:', err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-lg text-white shadow-sm">
            汉
          </div>
          <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            ChineseFlow
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge">中级</span>
          {currentUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-800">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-xs text-white font-bold">
                {(currentUser.display_name || currentUser.username)[0]}
              </div>
              <span className="text-sm text-amber-800 dark:text-amber-200">
                {currentUser.display_name || currentUser.username}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

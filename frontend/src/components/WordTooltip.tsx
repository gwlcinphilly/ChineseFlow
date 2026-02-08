import React from 'react';
import type { Word } from '../types';

interface WordTooltipProps {
  word: Word;
  position: { x: number; y: number };
}

export const WordTooltip: React.FC<WordTooltipProps> = ({ word, position }) => {
  return (
    <div
      className="tooltip-modern"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%) translateY(-12px)',
      }}
    >
      {/* Arrow */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 -bottom-1.5"
        style={{
          background: 'var(--glass-bg)',
          borderRight: '1px solid var(--glass-border)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      />
      
      <div className="relative space-y-3">
        <div className="text-4xl font-bold chinese-text text-center gradient-text">
          {word.text}
        </div>
        <div className="text-center text-primary-500 font-medium text-lg">
          {word.pinyin}
        </div>
        {word.translation && (
          <div className="text-sm text-surface-600 dark:text-surface-300 pt-2 border-t border-surface-200 dark:border-surface-700 text-center">
            {word.translation}
          </div>
        )}
      </div>
    </div>
  );
};

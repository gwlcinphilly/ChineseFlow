import React, { useState, useEffect, useRef } from 'react';
import type { Article, Word } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { WordTooltip } from './WordTooltip';

interface ArticleReaderProps {
  article: Article;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ article }) => {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [selectedWord, setSelectedWord] = useState<{
    word: Word;
    position: { x: number; y: number };
  } | null>(null);
  const [highlightedCharIndex, setHighlightedCharIndex] = useState<number>(-1);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: speechRecognitionSupported,
    error: recognitionError,
  } = useSpeechRecognition();

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

  const articleRef = useRef<HTMLDivElement>(null);

  // Highlight matching text based on speech recognition transcript
  useEffect(() => {
    if (transcript) {
      const cleanTranscript = transcript.replace(/[^\u4e00-\u9fa5]/g, '');
      const fullText = article.sentences.map(s => s.chinese).join('');
      const cleanFullText = fullText.replace(/[^\u4e00-\u9fa5]/g, '');

      const matchIndex = cleanFullText.indexOf(cleanTranscript);
      if (matchIndex !== -1) {
        setHighlightedCharIndex(matchIndex + cleanTranscript.length - 1);
      }
    }
  }, [transcript, article]);

  const handleWordClick = (e: React.MouseEvent, word: Word) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setSelectedWord({
      word,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    });
  };

  const handleSpeakSentence = (sentenceIndex: number) => {
    const sentence = article.sentences[sentenceIndex];
    speak(sentence.chinese, (charIndex) => {
      let absoluteIndex = 0;
      for (let i = 0; i < sentenceIndex; i++) {
        absoluteIndex += article.sentences[i].chinese.length;
      }
      setHighlightedCharIndex(absoluteIndex + charIndex);
    });
  };

  const handleSpeakAll = () => {
    const fullText = article.sentences.map(s => s.chinese).join('');
    speak(fullText, (charIndex) => {
      setHighlightedCharIndex(charIndex);
    });
  };

  const getCharacterIndex = (sentenceIndex: number, wordIndex: number, charIndex: number) => {
    let index = 0;
    for (let i = 0; i < sentenceIndex; i++) {
      index += article.sentences[i].chinese.length;
    }
    for (let j = 0; j < wordIndex; j++) {
      index += article.sentences[sentenceIndex].words[j].text.length;
    }
    index += charIndex;
    return index;
  };

  const isCharHighlighted = (sentenceIndex: number, wordIndex: number, charIndex: number) => {
    const index = getCharacterIndex(sentenceIndex, wordIndex, charIndex);
    return index <= highlightedCharIndex;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="glass-card">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {speechRecognitionSupported ? (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`btn ${isListening ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' : 'btn-primary'}`}
              >
                {isListening ? (
                  <>
                    <span className="pulse-dot mr-2"></span>
                    停止录音
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎤</span>
                    开始朗读
                  </>
                )}
              </button>
            ) : (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <span>⚠️</span>
                浏览器不支持语音识别，请使用 Chrome 或 Edge
              </div>
            )}
            
            <button
              onClick={isSpeaking ? stopSpeaking : handleSpeakAll}
              className={`btn ${isSpeaking ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'btn-secondary'}`}
            >
              {isSpeaking ? (
                <>
                  <span className="mr-2">⏹️</span>
                  停止
                </>
              ) : (
                <>
                  <span className="mr-2">🔊</span>
                  播放全部
                </>
              )}
            </button>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full transition-colors relative ${showPinyin ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showPinyin ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <input
                type="checkbox"
                checked={showPinyin}
                onChange={(e) => setShowPinyin(e.target.checked)}
                className="hidden"
              />
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-primary-500 transition-colors">
                显示拼音
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full transition-colors relative ${showTranslation ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showTranslation ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <input
                type="checkbox"
                checked={showTranslation}
                onChange={(e) => setShowTranslation(e.target.checked)}
                className="hidden"
              />
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-primary-500 transition-colors">
                显示翻译
              </span>
            </label>
          </div>
        </div>

        {recognitionError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {recognitionError}
          </div>
        )}

        {isListening && transcript && (
          <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <div className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">识别结果：</div>
            <div className="text-lg chinese-text gradient-text">{transcript}</div>
          </div>
        )}
      </div>

      {/* Article Content */}
      <div className="glass-card" ref={articleRef} onClick={() => setSelectedWord(null)}>
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center chinese-text gradient-text">
          {article.title}
        </h2>

        <div className="space-y-8">
          {article.sentences.map((sentence, sentenceIndex) => (
            <div key={sentence.id} className="group">
              {/* Chinese text with clickable words */}
              <div className="text-2xl md:text-3xl leading-relaxed mb-3 chinese-text">
                {sentence.words.map((word, wordIndex) => (
                  <span
                    key={`${sentenceIndex}-${wordIndex}`}
                    className="word-hover inline-block"
                    onClick={(e) => handleWordClick(e, word)}
                  >
                    {word.text.split('').map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className={isCharHighlighted(sentenceIndex, wordIndex, charIndex) ? 'highlight' : ''}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                ))}
              </div>

              {/* Pinyin */}
              {showPinyin && (
                <div className="text-sm md:text-base text-primary-600 dark:text-primary-400 mb-2 font-medium tracking-wide">
                  {sentence.pinyin}
                </div>
              )}

              {/* Translation */}
              {showTranslation && (
                <div className="text-base text-surface-500 dark:text-surface-400 mb-4">
                  {sentence.translation}
                </div>
              )}

              {/* Listen button for individual sentence */}
              <button
                onClick={() => handleSpeakSentence(sentenceIndex)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                <span>🔊</span>
                <span>播放此句</span>
              </button>

              {sentenceIndex < article.sentences.length - 1 && (
                <div className="section-divider" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Word Tooltip */}
      {selectedWord && (
        <WordTooltip
          word={selectedWord.word}
          position={selectedWord.position}
        />
      )}
    </div>
  );
};

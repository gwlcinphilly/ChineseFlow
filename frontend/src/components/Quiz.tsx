import React, { useState } from 'react';
import type { Article } from '../types';

interface QuizProps {
  article: Article;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export const Quiz: React.FC<QuizProps> = ({ article }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  // Generate quiz questions based on the article
  const generateQuestions = (): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];

    // Question 1: Translation of first sentence
    if (article.sentences.length > 0) {
      const sentence = article.sentences[0];
      questions.push({
        question: `"${sentence.chinese}" 是什么意思？`,
        options: [
          sentence.translation,
          "我每天喜欢学习中文。",
          "我的朋友明天要去北京。",
          "今天天气很好。"
        ],
        correctAnswer: 0
      });
    }

    // Question 2: Pinyin recognition
    if (article.sentences.length > 1) {
      const sentence = article.sentences[1];
      questions.push({
        question: `"${sentence.chinese}" 的正确拼音是什么？`,
        options: [
          sentence.pinyin,
          "wǒ xǐhuan chī píngguǒ",
          "tā míngtiān qù xuéxiào",
          "zhè běn shū hěn yǒuqù"
        ],
        correctAnswer: 0
      });
    }

    // Question 3: Word meaning
    if (article.sentences.length > 0 && article.sentences[0].words.length > 2) {
      const word = article.sentences[0].words[2];
      if (word.translation) {
        questions.push({
          question: `"${word.text}"（${word.pinyin}）是什么意思？`,
          options: [
            word.translation,
            "人",
            "明天",
            "美丽"
          ],
          correctAnswer: 0
        });
      }
    }

    return questions;
  };

  const questions = generateQuestions();

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (questions.length === 0) {
    return (
      <div className="glass-card text-center py-12">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-xl font-bold mb-2">理解测验</h3>
        <p className="text-surface-500 dark:text-surface-400">添加文章后即可参与测验。</p>
      </div>
    );
  }

  const isFinished = currentQuestion === questions.length - 1 && showResult;

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          理解测验
        </h3>
        <div className="badge">
          第 {currentQuestion + 1} 题 / 共 {questions.length} 题
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-6">
        <div 
          className="progress-bar-fill"
          style={{ width: `${((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {!isFinished ? (
        <>
          <div className="mb-8">
            <p className="text-lg font-medium mb-6 text-surface-800 dark:text-surface-200">
              {questions[currentQuestion].question}
            </p>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? showResult
                        ? index === questions[currentQuestion].correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-glow'
                          : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700'
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-soft'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-surface-700 dark:text-surface-300">{option}</span>
                    {showResult && index === questions[currentQuestion].correctAnswer && (
                      <span className="text-green-500 font-bold text-xl">✓</span>
                    )}
                    {showResult && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer && (
                      <span className="text-red-500 font-bold text-xl">✗</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {showResult && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="btn btn-primary"
              >
                {currentQuestion < questions.length - 1 ? '下一题 →' : '查看结果'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4 float-icon">
            {score === questions.length ? '🎉' : score >= questions.length / 2 ? '👍' : '📚'}
          </div>
          <h4 className="text-2xl font-bold mb-2 gradient-text">测验完成！</h4>
          <p className="text-xl mb-6 text-surface-600 dark:text-surface-400">
            得分：{score} / {questions.length}
          </p>
          <div className="progress-bar mb-6 max-w-xs mx-auto">
            <div
              className="progress-bar-fill"
              style={{ width: `${(score / questions.length) * 100}%` }}
            />
          </div>
          <button onClick={handleReset} className="btn btn-primary">
            再试一次
          </button>
        </div>
      )}
    </div>
  );
};

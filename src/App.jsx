import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css'; 
import { questions } from './utils/questions';
import { QUESTION_CATEGORIES } from './utils/QuestionMapping';
import { HandController } from './components/HandController';
import { ShufflingDeck } from './components/ShufflingDeck';
import { DeckFan } from './components/DeckFan';
import ManifestationEffect from './components/ManifestationEffect';

function App() {
  const [gamePhase, setGamePhase] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [drawnCards, setDrawnCards] = useState([]);
  const [shuffleSpeed, setShuffleSpeed] = useState(0);
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 });
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const showHudPhases = ['shuffle', 'drawing', 'reading'];

  const handleHandMove = useCallback((speed) => {
    setShuffleSpeed(speed);
  }, []);

  const handleHandUpdate = useCallback((x, y, grabbing, detected) => {
    setHandPosition({ x, y });
    setIsGrabbing(grabbing);
    setIsHandDetected(detected);
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setGamePhase('question');
  };

  const handleQuestionAnswered = (answerIndex) => {
    if (currentQuestion.nextQuestion) {
      setCurrentQuestion(questions.find(q => q.id === currentQuestion.nextQuestion));
    } else {
      setGamePhase('shuffle');
    }
  };

  const handleShuffleComplete = () => {
    setGamePhase('drawing');
  };

  const handleCardDraw = (cardId) => {
      const newCard = { id: cardId, name: 'The Fool', image: '/cards/major/00_the_fool.webp', upright: true };
      setDrawnCards([...drawnCards, newCard]);
      if (drawnCards.length + 1 >= 1) {
           setGamePhase('reading');
      }
  }

  const handleRestart = () => {
      setGamePhase('welcome');
      setDrawnCards([]);
      setSelectedCategory(null);
      setCurrentQuestion(questions[0]);
  }

  return (
    <div className="app-container">
      <ManifestationEffect />

      <header className="main-header">
        <h1>CHANNEL YOUR ENERGY</h1>
        <p className="instruction-text">
            {gamePhase === 'welcome' && "跟随内心的指引"}
            {gamePhase === 'question' && "聆听心声，做出你的选择"}
            {gamePhase === 'shuffle' && (isMobile ? "点击洗牌" : "挥动双手洗牌")}
            {gamePhase === 'drawing' && "抽取你的命运之牌"}
            {gamePhase === 'reading' && "牌面解读"}
        </p>
      </header>

      <main className="main-content">
        <AnimatePresence mode='wait'>
          
          {/* Welcome Phase */}
          {gamePhase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="welcome-container"
            >
              <div className="category-grid">
                {QUESTION_CATEGORIES.map((category) => (
                  <motion.div
                    key={category.id}
                    className="category-card"
                    onClick={() => handleCategorySelect(category.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-desc">{category.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Question Phase */}
          {gamePhase === 'question' && currentQuestion && (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center' }}
            >
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{currentQuestion.text}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className="option-button"
                    onClick={() => handleQuestionAnswered(index)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Shuffle & Drawing */}
          {(gamePhase === 'shuffle' || gamePhase === 'drawing') && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', height: '100%' }}
            >
                {gamePhase === 'shuffle' ? (
                  <ShufflingDeck onShuffleComplete={handleShuffleComplete} shuffleSpeed={shuffleSpeed} isMobile={isMobile} />
                ) : (
                  <DeckFan onCardDraw={handleCardDraw} handPosition={handPosition} isGrabbing={isGrabbing} isHandDetected={isHandDetected} isMobile={isMobile} />
                )}
            </motion.div>
          )}

          {/* Reading Phase */}
          {gamePhase === 'reading' && (
            <div style={{textAlign: 'center'}}>
                <h2>解读页面</h2>
                <button className="option-button" onClick={handleRestart}>重新开始</button>
            </div>
          )}

        </AnimatePresence>
      </main>

      {showHudPhases.includes(gamePhase) && !isMobile && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
            <HandController 
                onHandMoved={handleHandMove} 
                onHandUpdate={handleHandUpdate} 
                showFullSkeleton={gamePhase === 'shuffle'} 
            />
        </div>
      )}
    </div>
  );
}

export default App;
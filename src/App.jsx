import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css'; // 确保引入了刚才写的 CSS
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
      {/* 背景特效 */}
      <ManifestationEffect />

      {/* 顶部标题栏 */}
      <header className="main-header">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          CHANNEL YOUR ENERGY
        </motion.h1>
        <motion.p 
          className="instruction-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
            {gamePhase === 'welcome' && "跟随内心的指引，选择你的方向"}
            {gamePhase === 'question' && "聆听心声，做出你的选择"}
            {gamePhase === 'shuffle' && (isMobile ? "点击屏幕洗牌" : "挥动双手注入能量洗牌")}
            {gamePhase === 'drawing' && (isMobile ? "点击抽取卡牌" : "移动手势悬停并捏合抽取卡牌")}
            {gamePhase === 'reading' && "你的命运解读"}
        </motion.p>
      </header>

      {/* 主内容区域 */}
      <main className="main-content">
        <AnimatePresence mode='wait'>
          
          {/* 1. 欢迎页 */}
          {gamePhase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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

          {/* 2. 问题页 */}
          {gamePhase === 'question' && currentQuestion && (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="question-container"
            >
              <h2 className="question-text">{currentQuestion.text}</h2>
              <div className="options-grid">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    className="option-button"
                    onClick={() => handleQuestionAnswered(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. 洗牌页 */}
          {gamePhase === 'shuffle' && (
            <motion.div
              key="shuffle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', height: '100%' }}
            >
              <ShufflingDeck
                onShuffleComplete={handleShuffleComplete}
                shuffleSpeed={shuffleSpeed}
                isMobile={isMobile}
              />
            </motion.div>
          )}

          {/* 4. 抽牌页 */}
          {gamePhase === 'drawing' && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', height: '100%' }}
            >
              <DeckFan
                onCardDraw={handleCardDraw}
                handPosition={handPosition}
                isGrabbing={isGrabbing}
                isHandDetected={isHandDetected}
                isMobile={isMobile}
              />
            </motion.div>
          )}

           {/* 5. 解读页 */}
           {gamePhase === 'reading' && (
            <motion.div key="reading" initial={{opacity:0}} animate={{opacity:1}} style={{textAlign:'center', color:'white'}}>
                <h2>解读页面</h2>
                <button onClick={handleRestart} className="option-button" style={{marginTop:'20px'}}>重新开始</button>
            </motion.div>
           )}

        </AnimatePresence>
      </main>

      {/* 摄像头控件 */}
      {showHudPhases.includes(gamePhase) && !isMobile && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 2000 }}>
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
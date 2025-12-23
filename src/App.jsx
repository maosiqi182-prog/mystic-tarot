import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css'; // 🔥 恢复引用你的 CSS 文件，找回原来的美观样式
import { questions } from './utils/questions';
import { QUESTION_CATEGORIES } from './utils/QuestionMapping';
import { HandController } from './components/HandController';
import { ShufflingDeck } from './components/ShufflingDeck';
import { DeckFan } from './components/DeckFan';
// 🔥 关键修复：把背景特效组件找回来！
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
      // 模拟抽牌逻辑
      const newCard = { id: cardId, name: 'The Fool', image: '/cards/major/00_the_fool.webp', upright: true };
      setDrawnCards([...drawnCards, newCard]);
      if (drawnCards.length + 1 >= 1) {
           setGamePhase('reading'); // 这里暂时只抽一张就去解读，你可以改回 3 张
      }
  }

  const handleRestart = () => {
      setGamePhase('welcome');
      setDrawnCards([]);
      setSelectedCategory(null);
      setCurrentQuestion(questions[0]);
  }

  return (
    <div className="app-container"> {/* 🔥 恢复使用 CSS 类名 */}
      
      {/* 🔥 关键修复：把满屏飘牌的背景特效加回来了！ */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <ManifestationEffect />
      </div>

      {/* 顶部标题栏 */}
      <header className="main-header" style={{ position: 'relative', zIndex: 10 }}>
        <h1>CHANNEL YOUR ENERGY</h1>
        {/* 动态提示文字 */}
        <p className="instruction-text">
            {gamePhase === 'welcome' && "跟随内心的指引，选择你的方向"}
            {gamePhase === 'question' && "聆听心声，做出你的选择"}
            {gamePhase === 'shuffle' && (isMobile ? "点击屏幕洗牌" : "挥动双手注入能量洗牌")}
            {gamePhase === 'drawing' && (isMobile ? "点击抽取卡牌" : "移动手势悬停并捏合抽取卡牌")}
            {gamePhase === 'reading' && "你的命运解读"}
        </p>
      </header>

      {/* 主要内容区域 */}
      <main className="main-content" style={{ position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode='wait'>
          
          {/* 1. 欢迎页 (分类选择) */}
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
                  <motion.button
                    key={category.id}
                    className="category-card" // 恢复原来的样式类
                    onClick={() => handleCategorySelect(category.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-desc">{category.description}</p>
                  </motion.button>
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
                    className="option-button" // 恢复原来的样式类
                    onClick={() => handleQuestionAnswered(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
              className="shuffle-container"
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
              className="drawing-container"
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

           {/* 5. 解读页 (占位) */}
           {gamePhase === 'reading' && (
            <motion.div key="reading" initial={{opacity:0}} animate={{opacity:1}} style={{textAlign:'center', color:'white'}}>
                <h2>解读页面（开发中...）</h2>
                <button onClick={handleRestart} style={{padding:'10px 20px', marginTop:'20px', cursor:'pointer'}}>重新开始</button>
            </motion.div>
           )}

        </AnimatePresence>
      </main>

      {/* 摄像头控件 (保持右上角，且只在需要时显示) */}
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
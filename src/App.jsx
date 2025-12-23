import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { questions } from './utils/questions';
import { QUESTION_CATEGORIES, getSpreadByType } from './utils/QuestionMapping';
import { TarotCard } from './components/TarotCard';
// 确保这里用的是具名导入
import { HandController } from './components/HandController';
import { ShufflingDeck } from './components/ShufflingDeck';
import { DeckFan } from './components/DeckFan'; 

// 简单的 styles 定义，恢复布局美观
const styles = {
  appContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a0a2e 0%, #0d0d2b 100%)',
    color: '#e0dce0',
    fontFamily: '"Cinzel", serif',
    overflowX: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    padding: '2rem 0',
    background: 'rgba(0,0,0,0.2)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,215,0,0.1)',
    position: 'relative',
    zIndex: 10,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    letterSpacing: '0.2em',
    background: 'linear-gradient(45deg, #ffd700, #ffec8b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    textShadow: '0 2px 10px rgba(255,215,0,0.3)',
  },
  // 🔥 找回的操作提示样式
  instruction: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '1rem',
    marginTop: '0.5rem',
    letterSpacing: '0.05em',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh', // 确保足够高
    padding: '2rem',
    position: 'relative',
  },
  // 摄像头容器样式
  cameraWidget: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 2000,
  }
};

// ... (App 组件逻辑部分保持不变，为了节省篇幅，这里省略中间逻辑代码，请确保你保留了原来的逻辑) ...
// 如果你需要完整的 App.jsx 代码，请告诉我，我再发一次完整的。
// 下面直接快进到 return 部分的 JSX 结构修改。

function App() {
  // ... 这里是你原本的所有 useState, useEffect, handle 方法 ...
  // 假设你保留了之前的逻辑代码

  // --- 临时占位，请用你实际的代码替换这里 ---
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
      // 简化的抽牌逻辑，实际请用你原来的
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
  // -------------------------------------------


  return (
    <div style={styles.appContainer}>
      {/* 顶部标题栏 */}
      <header style={styles.header}>
        <h1 style={styles.title}>CHANNEL YOUR ENERGY</h1>
        {/* 🔥 找回的操作提示文字 */}
        <p style={styles.instruction}>
            {gamePhase === 'shuffle' && (isMobile ? "点击屏幕洗牌" : "挥动双手注入能量洗牌")}
            {gamePhase === 'drawing' && (isMobile ? "点击抽取卡牌" : "移动手势悬停并捏合抽取卡牌")}
            {gamePhase === 'reading' && "你的命运解读"}
            {gamePhase === 'welcome' || gamePhase === 'question' ? "跟随内心的指引" : ""}
        </p>
      </header>

      {/* 主要内容区域，应用了 flex 居中样式 */}
      <main style={styles.mainContent}>
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
                  <motion.button
                    key={category.id}
                    className="category-card"
                    onClick={() => handleCategorySelect(category.id)}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,215,0,0.15)' }}
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

          {/* Question Phase */}
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
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,215,0,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Shuffle Phase */}
          {gamePhase === 'shuffle' && (
            <motion.div
              key="shuffle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <ShufflingDeck
                onShuffleComplete={handleShuffleComplete}
                shuffleSpeed={shuffleSpeed}
                isMobile={isMobile}
              />
            </motion.div>
          )}

          {/* Drawing Phase - 这里是牌扇 */}
          {gamePhase === 'drawing' && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // 🔥 确保这里占满空间并居中
              style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <DeckFan
                on CardDraw={handleCardDraw}
                handPosition={handPosition}
                isGrabbing={isGrabbing}
                isHandDetected={isHandDetected}
                isMobile={isMobile}
              />
            </motion.div>
          )}

           {/* Reading Phase (Placeholder) */}
           {gamePhase === 'reading' && (
            <motion.div key="reading" initial={{opacity:0}} animate={{opacity:1}}>
                <h2 style={{color:'white'}}>解读页面（待完善）</h2>
                <button onClick={handleRestart} style={{padding:'10px 20px', marginTop:'20px', cursor:'pointer'}}>重新开始</button>
            </motion.div>
           )}

        </AnimatePresence>
      </main>

      {/* 摄像头控件 */}
      {showHudPhases.includes(gamePhase) && !isMobile && (
        <div style={styles.cameraWidget}>
            <HandController 
                onHandMoved={handleHandMove} 
                onHandUpdate={handleHandUpdate} 
                showFullSkeleton={gamePhase === 'shuffle'} 
                style={{ width: '200px', height: '150px' }}
            />
        </div>
      )}
    </div>
  );
}

export default App;
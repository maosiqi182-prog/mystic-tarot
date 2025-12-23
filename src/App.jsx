import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { generateDeck } from './utils/tarotData';
import { getCardMeaning } from './utils/tarotMeanings';
import { SPREADS, getSpreadLayout } from './utils/LayoutEngine';
import { QUESTION_CATEGORIES, getSpreadByType } from './utils/QuestionMapping';
import { TarotCard } from './components/TarotCard';
import { HandController } from './components/HandController';
import { ShufflingDeck } from './components/ShufflingDeck';
import { DeckFan } from './components/DeckFan'; 
import { CardParticleTransition } from './components/CardParticleTransition';
import { ManifestationEffect } from './components/ManifestationEffect'; 
import { getTarotReading } from './utils/gemini'; 

const SPREAD_POSITIONS = {
    SINGLE: [{ en: "Core Guidance", cn: "核心指引" }],
    TIME_FLOW: [
        { en: "The Past", cn: "过去的影响", desc: { en: "Root cause", cn: "问题的根源与起因" } },
        { en: "The Present", cn: "现在的处境", desc: { en: "Current energy", cn: "当下的能量与状态" } },
        { en: "The Future", cn: "未来的趋势", desc: { en: "Likely outcome", cn: "未来的发展趋势" } }
    ],
    LOVE_PYRAMID: [
        { en: "You", cn: "你的状态", desc: { en: "Your feelings", cn: "你在关系中的心态" } },
        { en: "Them", cn: "对方的状态", desc: { en: "Their feelings", cn: "对方的想法与态度" } },
        { en: "Relationship", cn: "关系现状", desc: { en: "Current dynamic", cn: "目前关系的本质" } },
        { en: "Future", cn: "未来发展", desc: { en: "Where it is going", cn: "这段关系的走向" } }
    ]
};

const UI_TEXT = {
  en: { 
    title: "Mystic Tarot", subtitle: "Ask the universe", inputTitle: "What is your question?", inputPlaceholder: "e.g. Will I find love?", inputBtn: "Consult", focusTitle: "Visualize Your Question", guideTitle: "Destiny Awaits", guideHand: "Move Hand to Spin", guideFist: "HOLD FIST to Select", hudPicking: "THE ARCANA", hudHover: "Hover to seek • Hold Fist to Select", hudManifesting: "THE CARDS ARE DRAWN...", revelation: "YOUR READING", hudReveal: "Wave hand to reveal", placeholderTitle: "Card Meaning", placeholderDesc: "Select a card to reveal its meaning." 
  },
  cn: { 
    title: "神秘塔罗", subtitle: "向宇宙提问，它必将回应", inputTitle: "你心中的疑惑是？", inputPlaceholder: "例如：最近财运如何？", inputBtn: "开始占卜", focusTitle: "请在心中默念", guideTitle: "命运回响", guideHand: "挥手 · 以此搅动星河", guideFist: "握拳 · 长按抽取", hudPicking: "星环选牌", hudHover: "移动寻找 · 握拳确认选择", hudManifesting: "牌阵已生成...", revelation: "牌面解读", hudReveal: "挥手/点击 揭示牌面", placeholderTitle: "牌面含义", placeholderDesc: "请选择一张牌以查看其解读。" 
  }
};

const styles = {
  container: { width: '100vw', height: '100vh', background: 'radial-gradient(circle at 50% 120%, #1a0b2e 0%, #000000 60%)', overflow: 'hidden', position: 'relative' },
  uiOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  glassCard: { pointerEvents: 'auto', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '60px 40px', borderRadius: '4px', border: '1px solid rgba(191, 149, 63, 0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.9)', maxWidth: '900px', width: '90%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: { fontFamily: '"Cinzel", serif', fontSize: '4rem', margin: '0 0 10px 0', letterSpacing: '12px', textTransform: 'uppercase', fontWeight: 800, textShadow: '0 0 20px rgba(191, 149, 63, 0.3)', color: '#FFD700' },
  subtitle: { fontFamily: '"Lato", sans-serif', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '60px', fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase' },
  buttonGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', width: '100%' },
  button: { padding: '30px 20px', borderRadius: '2px', cursor: 'pointer', textAlign: 'center', position: 'relative', transition: 'all 0.5s ease', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' },
  buttonTitle: { display: 'block', fontFamily: '"Cinzel", serif', fontSize: '1.4rem', marginBottom: '10px', letterSpacing: '2px', color: '#E0E0E0' },
  buttonDesc: { display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.3)', fontStyle: 'normal', letterSpacing: '1px' },
  divider: { width: '1px', height: '40px', background: 'linear-gradient(to bottom, transparent, rgba(191, 149, 63, 0.8), transparent)', margin: '0 auto 10px auto' },
  energyContainer: { position: 'absolute', bottom: '40px', width: '60%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' },
  energyBar: { height: '100%', background: '#FFD700', boxShadow: '0 0 15px #FFD700', width: '0%', transition: 'width 0.1s linear' },
  cursor: { position: 'absolute', width: '60px', height: '60px', borderRadius: '50%', pointerEvents: 'none', transform: 'translate(-50%, -50%)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'opacity 0.2s' },
  inputContainer: { display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', gap: '20px' },
  inputField: { width: '80%', padding: '15px', background: 'rgba(0,0,0,0.5)', border: '1px solid #FFD700', color: '#FFF', fontSize: '1.2rem', fontFamily: '"Cinzel", serif', textAlign: 'center', outline: 'none' },
  confirmButton: { padding: '15px 40px', background: '#FFD700', color: '#000', border: 'none', fontSize: '1rem', fontFamily: '"Cinzel", serif', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '2px' },
  
  readingPanel: { 
    position: 'absolute', 
    top: '15%', 
    left: '5%',           
    width: '320px',       
    maxHeight: '75vh',    
    overflowY: 'auto',    
    background: 'rgba(0, 0, 0, 0.85)', 
    backdropFilter: 'blur(20px)', 
    border: '1px solid rgba(191, 149, 63, 0.5)', 
    borderRadius: '4px', 
    padding: '25px', 
    color: '#fff', 
    zIndex: 40, 
    boxShadow: '0 10px 40px rgba(0,0,0,0.8)', 
    animation: 'fadeIn 1s ease-out', 
    pointerEvents: 'auto' 
  },
  
  cameraWidget: { pointerEvents: 'auto', position: 'absolute', top: '30px', right: '30px', zIndex: 20 },
  slotContainer: { position: 'absolute', bottom: '100px', display: 'flex', gap: '20px', zIndex: 20 },
  slot: { width: '40px', height: '60px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', transition: 'all 0.3s' },
  slotFilled: { background: '#FFD700', boxShadow: '0 0 15px #FFD700', border: '1px solid #fff' }
};

function App() {
  const deck = useMemo(() => generateDeck(), []);
  const [deckOrder, setDeckOrder] = useState([...Array(78).keys()]);
  const [gamePhase, setGamePhase] = useState('intro');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [targetSpreadInfo, setTargetSpreadInfo] = useState(null);
  const [activeCards, setActiveCards] = useState([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [language, setLanguage] = useState('en');
  const inputRef = useRef(null);
  const [sharedBackTexture, setSharedBackTexture] = useState(null);
  const bgmRef = useRef(null);
  const sfxRef = useRef(null);
  const speedRef = useRef(0);
  const energyBarRef = useRef(null); 
  const [accumulation, setAccumulation] = useState(0);
  const [spreadProgress, setSpreadProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isAutoSpreading, setIsAutoSpreading] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const handXRef = useRef(0);
  const handYRef = useRef(0);
  const isGrabbingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const cooldownRef = useRef(false);
  const grabDurationRef = useRef(0);
  const [grabProgress, setGrabProgress] = useState(0); 
  const [collectedCount, setCollectedCount] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState([]);
  const [focusedCard, setFocusedCard] = useState(null);
  const frameRef = useRef(0);
  const t = UI_TEXT[language];

  const [aiReadings, setAiReadings] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/textures/tarot-back.jpg', (tex) => { tex.colorSpace = THREE.SRGBColorSpace; setSharedBackTexture(tex); });
    bgmRef.current = new Audio('/bgm.mp3'); sfxRef.current = new Audio('/sfx.mp3');
    bgmRef.current.loop = true; bgmRef.current.volume = 0.4; sfxRef.current.loop = false; sfxRef.current.volume = 0; 
    return () => { if(bgmRef.current) bgmRef.current.pause(); if(sfxRef.current) sfxRef.current.pause(); };
  }, []);

  useEffect(() => {
    let animationFrameId;
    const loop = () => {
      frameRef.current++;
      if (speedRef.current > 0) speedRef.current = Math.max(0, speedRef.current - 5);
      if (gamePhase === 'shuffle' && sfxRef.current) { const target = Math.min(speedRef.current / 50, 1) * 0.8; sfxRef.current.volume += (target - sfxRef.current.volume) * 0.2; }
      else if (sfxRef.current) { sfxRef.current.volume *= 0.9; }
      if (gamePhase === 'shuffle' && energyBarRef.current) { energyBarRef.current.style.width = `${accumulation}%`; }
      if (isTransitioning) setTransitionProgress(p => { const n = p + 0.02; if (n >= 1.2) { setIsTransitioning(false); setGamePhase('deck_ready'); return 0; } return n; });
      if (isAutoSpreading) setSpreadProgress(p => { const n = p + 2.0; if (n >= 100) { setIsAutoSpreading(false); setGamePhase('picking_guide'); return 100; } return n; });

      if (frameRef.current % 2 === 0) {
        if (gamePhase === 'picking') {
          const rawX = -handXRef.current; 
          let normalized = (rawX + 0.4) / 0.8; 
          if (isNaN(normalized)) normalized = 0.5;
          const index = Math.floor(normalized * 78);
          setHoverIndex(Math.max(0, Math.min(77, index)));

          if (isGrabbingRef.current && !cooldownRef.current) {
              grabDurationRef.current += 1;
              const threshold = 45;
              const progress = Math.min((grabDurationRef.current / threshold) * 100, 100);
              setGrabProgress(progress);
              if (grabDurationRef.current >= threshold) {
                  handleAutoSelect(); 
                  cooldownRef.current = true;
                  grabDurationRef.current = 0;
                  setGrabProgress(0);
              }
          } else {
              if (grabDurationRef.current > 0) { grabDurationRef.current = Math.max(0, grabDurationRef.current - 5); setGrabProgress((grabDurationRef.current / 45) * 100); } else { setGrabProgress(0); }
          }
        }
        if (gamePhase === 'revealed') {
            if (isHoveringRef.current) {
                const rawX = -handXRef.current; 
                let normalized = (rawX + 0.25) / 0.5; 
                normalized = Math.max(0, Math.min(1, normalized));
                const cardCount = activeCards.length;
                const targetIndex = Math.floor(normalized * cardCount);
                const safeTargetIndex = Math.max(0, Math.min(cardCount - 1, targetIndex));
                if (safeTargetIndex >= 0 && safeTargetIndex < cardCount) {
                    if (!revealedIndices.includes(safeTargetIndex)) {
                        setRevealedIndices(prev => [...prev, safeTargetIndex]);
                        if(sfxRef.current) { sfxRef.current.currentTime = 0; sfxRef.current.play().catch(e=>{}); }
                        setFocusedCard(activeCards[safeTargetIndex]);
                    } else { if (focusedCard !== activeCards[safeTargetIndex]) setFocusedCard(activeCards[safeTargetIndex]); }
                }
            }
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gamePhase, accumulation, isTransitioning, isAutoSpreading, activeCards, revealedIndices, focusedCard]);

  const handleAutoSelect = () => {
      const needed = targetSpreadInfo ? targetSpreadInfo.count : 3;
      const newSelected = [];
      const availableIndices = [...Array(78).keys()];
      for (let i = 0; i < needed; i++) {
          const randomIndex = Math.floor(Math.random() * availableIndices.length);
          newSelected.push(availableIndices[randomIndex]);
          availableIndices.splice(randomIndex, 1);
      }
      setSelectedIndices(newSelected);
      if(sfxRef.current) { sfxRef.current.currentTime = 0; sfxRef.current.volume = 1.0; sfxRef.current.play().catch(e=>{}); }
      setGamePhase('manifesting');

      const layoutKey = targetSpreadInfo.name === "Love Pyramid" ? "LOVE_PYRAMID" : (targetSpreadInfo.count === 3 ? "TIME_FLOW" : "SINGLE");
      const layoutData = getSpreadLayout(layoutKey);
      
      const selectedCardsData = newSelected.map((fanIndex, i) => { 
        const realCardIndex = deckOrder[fanIndex]; 
        const isReversed = Math.random() > 0.5; 
        return { ...deck[realCardIndex], position: layoutData[i], isReversed }; 
      });
      
      setAiReadings(null);
      setIsAiLoading(true);
      const posDefinitions = SPREAD_POSITIONS[layoutKey];
      
      getTarotReading(userQuestion, layoutKey, selectedCardsData, posDefinitions, language)
        .then(aiResult => {
            if (aiResult && aiResult.readings) {
                setAiReadings(aiResult.readings); 
            }
            setIsAiLoading(false);
        });

      setTimeout(() => {
          finishPicking(newSelected, selectedCardsData); 
      }, 3000); 
  };

  const finishPicking = (finalIndices, preCalculatedCards) => { 
      setActiveCards(preCalculatedCards); 
      setGamePhase('revealed'); 
      setFocusedCard(null); 
  };

  const handleCategorySelect = (category) => { if(bgmRef.current) bgmRef.current.play().catch(e=>{}); if(sfxRef.current) sfxRef.current.play().catch(e=>{}); setSelectedCategory(category); const spreadType = getSpreadByType(category.id); setTargetSpreadInfo(SPREADS[spreadType]); setGamePhase('input'); };
  const handleQuestionSubmit = () => { if (!userQuestion.trim()) return; const hasChinese = /[\u4e00-\u9fa5]/.test(userQuestion); setLanguage(hasChinese ? 'cn' : 'en'); setGamePhase('focus'); };
  useEffect(() => { if (gamePhase === 'picking_guide') { const timer = setTimeout(() => { setGamePhase('picking'); }, 3500); return () => clearTimeout(timer); } }, [gamePhase]);
  useEffect(() => { if (gamePhase === 'focus') { const timer = setTimeout(() => { setGamePhase('shuffle'); }, 5000); return () => clearTimeout(timer); } }, [gamePhase]);
  useEffect(() => { if (gamePhase === 'shuffle') { const newOrder = [...Array(78).keys()]; for (let i = newOrder.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]]; } setDeckOrder(newOrder); } }, [gamePhase]);
  const handleHandMove = (speed) => { speedRef.current = Math.min(speed, 120); if (gamePhase === 'shuffle' && !isTransitioning) { setAccumulation(prev => { const n = prev + speed * 0.06; return n >= 100 ? (setIsTransitioning(true), 100) : n; }); } if (gamePhase === 'deck_ready' && !isAutoSpreading) { setIsAutoSpreading(true); } };
  const handleHandUpdate = (x, y, grabbing, hovering) => { if (hovering) { handXRef.current = x; handYRef.current = y; } isGrabbingRef.current = grabbing; isHoveringRef.current = hovering; };
  const handleCardClick = (index) => { if (!revealedIndices.includes(index)) { setRevealedIndices(prev => [...prev, index]); if(sfxRef.current) sfxRef.current.play().catch(e=>{}); } setFocusedCard(activeCards[index]); };
  
  const generateReading = (card, index) => {
      if (!card) return null;
      const baseMeaning = getCardMeaning(card.name, card.isReversed, language);
      const spreadKey = targetSpreadInfo.name === "Love Pyramid" ? "LOVE_PYRAMID" : (targetSpreadInfo.count === 3 ? "TIME_FLOW" : "SINGLE");
      const posIndex = index >= SPREAD_POSITIONS[spreadKey].length ? 0 : index;
      const positionInfo = SPREAD_POSITIONS[spreadKey][posIndex];

      let analysisText = baseMeaning.description;
      let isAiContent = false;

      if (aiReadings && aiReadings[index]) {
          analysisText = aiReadings[index];
          isAiContent = true;
      } else if (isAiLoading) {
          analysisText = language === 'cn' ? "✨ 星辰正在连接，正在接收宇宙信号..." : "✨ Connecting to the stars, receiving cosmic signals...";
      }

      return {
          ...baseMeaning,
          positionName: language === 'cn' ? positionInfo.cn : positionInfo.en,
          positionDesc: language === 'cn' ? positionInfo.desc?.cn : positionInfo.desc?.en,
          fullAnalysis: analysisText,
          isAiContent
      };
  };

  const currentReading = focusedCard ? generateReading(focusedCard, activeCards.indexOf(focusedCard)) : null;
  const showHudPhases = ['shuffle', 'deck_ready', 'fanning', 'picking', 'picking_guide', 'manifesting', 'revealed'];

  return (
    <div style={styles.container}>
      <style>{`@keyframes breathe { 0%, 100% { opacity: 0.5; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.02); } }`}</style>
      <div style={styles.uiOverlay}>
        {gamePhase === 'intro' && (<div style={styles.glassCard}><h1 style={styles.title}>{t.title}</h1><p style={styles.subtitle}>{t.subtitle}</p><div style={styles.buttonGrid}>{QUESTION_CATEGORIES.map(cat => (<button key={cat.id} style={styles.button} onClick={() => handleCategorySelect(cat)}><div style={styles.divider}></div><h3 style={styles.buttonTitle}>{cat.label.split(' ')[0]}</h3></button>))}</div></div>)}
        {gamePhase === 'input' && selectedCategory && (<div style={styles.glassCard}><h2 style={{...styles.title, fontSize: '2rem', marginBottom: '10px'}}>{t.inputTitle}</h2><div style={styles.inputContainer}><input ref={inputRef} type="text" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} placeholder={t.inputPlaceholder} style={styles.inputField} onKeyDown={(e) => e.key === 'Enter' && handleQuestionSubmit()} /><button style={styles.confirmButton} onClick={handleQuestionSubmit}>{t.inputBtn}</button></div></div>)}
        {gamePhase === 'focus' && selectedCategory && (<div style={{...styles.glassCard, background: 'transparent', boxShadow: 'none', border: 'none'}}><div style={{ fontFamily: '"Cinzel", serif', fontSize: '2.5rem', color: '#E0E0E0', textAlign: 'center', animation: 'breathe 3s infinite ease-in-out' }}>{t.focusTitle}<br/><span style={{ fontSize: '3rem', display: 'block', marginTop: '20px', color: '#FFD700', textShadow: '0 0 20px rgba(191, 149, 63, 0.6)' }}>"{userQuestion}"</span></div></div>)}
        {gamePhase === 'picking_guide' && (<div style={styles.glassCard}><h2 style={{...styles.title, fontSize: '2rem', marginBottom: '20px'}}>{t.guideTitle}</h2><div style={{display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '30px'}}><div style={{textAlign: 'center'}}><div style={{fontSize: '3rem', marginBottom: '10px'}}>🖐</div><p style={{color: '#ddd'}}>{t.guideHand}</p></div><div style={{textAlign: 'center'}}><div style={{fontSize: '3rem', marginBottom: '10px'}}>✊</div><p style={{color: '#FFD700', fontWeight: 'bold'}}>{t.guideFist}</p></div></div></div>)}
        
        {/* Manifesting 阶段 */}
        {gamePhase === 'manifesting' && (<div style={{...styles.glassCard, background: 'transparent', boxShadow: 'none', border: 'none'}}><div style={{ fontFamily: '"Cinzel", serif', fontSize: '3rem', color: '#C0C0C0', textAlign: 'center', letterSpacing: '8px', textShadow: '0 0 30px rgba(192, 192, 192, 0.4)', animation: 'breathe 3s infinite ease-in-out' }}>{t.hudManifesting}</div></div>)}
        
        {showHudPhases.includes(gamePhase) && !isTransitioning && gamePhase !== 'picking_guide' && gamePhase !== 'revealed' && gamePhase !== 'manifesting' && (
           <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}> 
             <div style={{position: 'absolute', top: '10%', width: '100%', textAlign: 'center'}}><h2 style={{...styles.title, fontSize: '2rem', letterSpacing: '5px', transition: 'all 0.5s'}}>{gamePhase === 'picking' ? t.hudPicking : "CHANNEL YOUR ENERGY"}</h2><p style={{color: '#aaa', fontSize: '1rem', marginTop: '10px', textShadow: '0 0 10px black'}}>{gamePhase === 'picking' ? t.hudHover : ""}</p></div>
             {gamePhase === 'shuffle' && (<div style={styles.uiOverlay}><div style={styles.energyContainer}><div ref={energyBarRef} style={styles.energyBar}></div></div><p style={{position: 'absolute', bottom: '20px', color: '#666', fontSize: '0.8rem'}}>{Math.floor(accumulation)}%</p></div>)}
             {gamePhase === 'picking' && grabProgress > 0 && (<div style={{...styles.cursor, left: `${(hoverIndex / 78) * 70 + 15}%`, top: '60%', opacity: Math.min(grabProgress / 20, 1)}}><svg width="60" height="60" viewBox="0 0 60 60" style={{transform: 'rotate(-90deg)'}}><circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255, 215, 0, 0.2)" strokeWidth="4" /><circle cx="30" cy="30" r="26" fill="none" stroke="#FFD700" strokeWidth="4" strokeDasharray="164" strokeDashoffset={164 - (164 * grabProgress) / 100} style={{transition: 'stroke-dashoffset 0.1s linear'}}/></svg></div>)}
           </div>
        )}

        {gamePhase === 'revealed' && (
            <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
                <div style={{position: 'absolute', top: '5%', width: '100%', textAlign: 'center'}}><h2 style={{...styles.title, fontSize: '2rem', letterSpacing: '5px'}}>{t.revelation}</h2><p style={{color: '#aaa', fontSize: '1rem'}}>{t.hudReveal}</p></div>
                
                {/* 解牌面板 */}
                <div style={styles.readingPanel}>
                    {focusedCard && currentReading ? (
                        <>
                            <h3 style={{color: '#C0C0C0', fontFamily: '"Cinzel", serif', marginBottom: '5px', fontSize: '1.8rem', textShadow: '0 0 10px rgba(192,192,192,0.3)'}}>{currentReading.title}</h3>
                            <p style={{color: focusedCard.isReversed ? '#ff6b6b' : '#4ecdc4', fontSize: '1rem', marginBottom: '20px', fontWeight: 'bold', letterSpacing: '2px'}}>{currentReading.orientation}</p>
                            <div style={{marginBottom: '20px', padding: '10px', border: '1px solid rgba(192,192,192,0.2)', background: 'rgba(255,255,255,0.05)'}}><span style={{display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase'}}>POSITION</span><span style={{display: 'block', fontSize: '1.2rem', color: '#fff'}}>{currentReading.positionName}</span>{currentReading.positionDesc && <span style={{display: 'block', fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic', marginTop: '5px'}}>{currentReading.positionDesc}</span>}</div>
                            
                            {/* AI 标识 */}
                            {currentReading.isAiContent && <div style={{fontSize:'0.7rem', color:'#FFD700', marginBottom:'5px', textTransform:'uppercase'}}>✨ DeepSeek Interpretation</div>}
                            
                            <div style={{fontSize: '0.95rem', lineHeight: '1.8', color: '#eee', textAlign: 'left', whiteSpace: 'pre-wrap'}}>
                                {currentReading.fullAnalysis}
                            </div>
                        </>
                    ) : (<><h3 style={{color: '#888', fontFamily: '"Cinzel", serif', marginBottom: '15px', fontSize: '1.5rem'}}>{t.placeholderTitle}</h3><p style={{fontSize: '0.95rem', lineHeight: '1.6', color: '#aaa'}}>{t.placeholderDesc}</p></>)}
                </div>
            </div>
        )}
        
        {showHudPhases.includes(gamePhase) && (<div style={styles.cameraWidget}><HandController onHandMoved={handleHandMove} onHandUpdate={handleHandUpdate} showFullSkeleton={gamePhase === 'shuffle'} style={{ width: '160px', height: '120px' }}/></div>)}
      </div>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={['#050108']} /><fog attach="fog" args={['#050108', 8, 30]} />
        <ambientLight intensity={0.5} /><directionalLight position={[0, 0, 5]} intensity={2.0} color="#ffffff" /><pointLight position={[5, 5, 5]} intensity={1} color="#FFD700" distance={20} /><pointLight position={[-5, 5, 5]} intensity={1} color="#8a2be2" distance={20} />
        <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={0.3} /><Sparkles count={150} scale={12} size={3} speed={0.4} color={"#8a2be2"} opacity={0.6} />
        <group>
          {gamePhase === 'revealed' && (<group position={[0, -1, 0]}>{activeCards.map((card, index) => (<TarotCard key={index} data={card} position={card.position} index={index} isRevealed={revealedIndices.includes(index)} onClick={handleCardClick} backTexture={sharedBackTexture} />))}</group>)}
          {gamePhase === 'shuffle' && <ShufflingDeck speed={speedRef.current} />}
          <CardParticleTransition active={isTransitioning} progress={transitionProgress} />
          {['deck_ready', 'fanning', 'picking', 'picking_guide'].includes(gamePhase) && (<DeckFan spreadProgress={spreadProgress} hoverIndex={gamePhase === 'picking' ? hoverIndex : -1} selectedIndices={selectedIndices} backTexture={sharedBackTexture} />)}
          <ManifestationEffect active={gamePhase === 'manifesting'} />
        </group>
      </Canvas>
    </div>
  );
}

export default App;
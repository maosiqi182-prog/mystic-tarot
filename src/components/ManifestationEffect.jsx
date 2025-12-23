import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// 使用一张通用的塔罗牌背面或正面图，还原满天飞牌的效果
const CARD_IMAGE = "https://www.sacred-texts.com/tarot/pkt/img/penta14.jpg"; 

const ManifestationEffect = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 30 + 50, // 还原卡片大小
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
      rotation: Math.random() * 360,
    }));
  }, []);

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 1.5,
            backgroundImage: `url(${CARD_IMAGE})`,
            backgroundSize: 'cover',
            opacity: p.opacity,
            rotate: p.rotation,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
            rotate: [p.rotation, p.rotation + 45, p.rotation]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export default ManifestationEffect;
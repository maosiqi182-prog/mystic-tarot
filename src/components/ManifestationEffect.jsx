import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const ManifestationEffect = () => {
  // 生成 30 个随机粒子，营造神秘氛围
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // 随机水平位置 0-100%
      y: Math.random() * 100, // 随机垂直位置 0-100%
      size: Math.random() * 3 + 1, // 随机大小
      duration: Math.random() * 10 + 10, // 随机飘动速度
      delay: Math.random() * 5, // 随机延迟
      opacity: Math.random() * 0.5 + 0.1, // 随机透明度
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
        pointerEvents: 'none', // 让鼠标可以穿透背景点击下面的东西
        zIndex: 0 
      }}
    >
      {/* 渲染粒子 */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: '#ffd700', // 金色粒子
            boxShadow: `0 0 ${p.size * 2}px #ffd700`, // 发光效果
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -100, 0], // 上下漂浮
            opacity: [p.opacity, p.opacity * 2, p.opacity], // 闪烁
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}

      {/* 增加一个半透明的渐变遮罩，让背景更有层次感 */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(26, 10, 46, 0) 0%, rgba(13, 13, 43, 0.8) 100%)'
        }}
      />
    </div>
  );
};

// 🔥🔥🔥 核心修复：加上这一行，App.jsx 就不报错了！
export default ManifestationEffect;
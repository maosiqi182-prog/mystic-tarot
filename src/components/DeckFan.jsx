// src/components/DeckFan.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { TarotCard } from './TarotCard';
import * as THREE from 'three';
import { generateDeck } from '../utils/tarotData';

const dummyDeck = generateDeck();

export const DeckFan = React.memo(function DeckFan({ spreadProgress, hoverIndex, selectedIndices, backTexture }) {
  const groupRef = useRef();
  // 关键优化：创建一个 Ref 数组来直接引用这 78 个 3D 物体，完全绕过 React 的重绘流程
  const cardRefs = useRef([]);
  
  const timeRef = useRef(0); 
  const currentSpeedRef = useRef(0); 
  const closestIndexRef = useRef(-1);

  // 预计算轨道参数，这一步不需要动
  const orbitData = useMemo(() => {
    return dummyDeck.map((_, i) => {
      const progress = i / 78; 
      const baseAngle = progress * Math.PI * 2 * 6; // 6圈
      const radius = 4 + progress * 7; // 内圈4，外圈11
      const yOffset = Math.sin(progress * Math.PI * 10) * 2.5 + (progress - 0.5) * 4;
      const speedFactor = 1.5 - progress * 0.8; 
      // 增加一个随机相位，让每张牌的呼吸节奏不完全同步，更自然
      const randomPhase = Math.random() * Math.PI * 2;
      return { baseAngle, radius, yOffset, speedFactor, randomPhase };
    });
  }, []);


  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // --- 1. 速度控制 (手势) ---
    // 增加基础“怠速”，即使手不动，星系也会有极慢的自转（呼吸感之一）
    const idleSpeed = 0.05; 
    
    let targetSpeed = 0;
    if (hoverIndex !== -1) {
        // 手势控制时的额外速度
        targetSpeed = (hoverIndex - 39) / 39 * 1.5;
    }
    
    // 平滑插值速度
    currentSpeedRef.current = THREE.MathUtils.lerp(
        currentSpeedRef.current, 
        targetSpeed, 
        delta * 2
    );
    
    // 实际应用速度 = 手势速度 + 怠速
    const finalSpeed = currentSpeedRef.current + (currentSpeedRef.current === 0 ? idleSpeed : 0);
    timeRef.current += delta * finalSpeed;

    // --- 2. 寻找最近的牌 ---
    let minDistance = Infinity;
    let closestIdx = -1;
    const cameraFocusPoint = new THREE.Vector3(0, 0, 8); // 假设镜头观察点
    
    // --- 3. 遍历并直接更新每一张牌 (Direct Manipulation) ---
    // 这种写法不会触发 React 组件重绘，性能极高
    cardRefs.current.forEach((cardObj, i) => {
        if (!cardObj || selectedIndices.includes(i)) return; // 跳过已飞走的牌
        
        const orbit = orbitData[i];

        // A. 计算星轨位置
        const currentAngle = orbit.baseAngle + timeRef.current * orbit.speedFactor;
        
        // B. 计算呼吸感 (Breathing)
        // 利用 state.clock.elapsedTime 产生连续的正弦波
        // yBob: 上下浮动
        const yBob = Math.sin(state.clock.elapsedTime * 0.5 + orbit.randomPhase) * 0.2;
        // scalePulse: 微微的缩放律动
        const scalePulse = Math.sin(state.clock.elapsedTime * 0.3 + orbit.randomPhase) * 0.02;

        const x = orbit.radius * Math.cos(currentAngle);
        const z = orbit.radius * Math.sin(currentAngle);
        const y = orbit.yOffset + yBob; // 加上呼吸浮动

        // 临时设置位置，用于计算距离
        cardObj.position.set(x, y, z);

        // C. 计算距离以确定 C 位
        // 这里做一个简单的 distanceTo
        // 注意：cardObj.position 是局部坐标，因为 group 整体后移了，所以要转换一下或者简单估算
        // 为了性能，我们这里直接用变换后的坐标估算
        // Group 在 [0, -1, -5]，所以世界坐标 z 大概是 z - 5
        const distToCamera = Math.sqrt(
            x * x + 
            y * y + 
            (z + 5 - 8) * (z + 5 - 8) // z + groupZ - cameraZ
        );

        if (distToCamera < minDistance) {
            minDistance = distToCamera;
            closestIdx = i;
        }

        // D. 基础姿态
        let targetScale = 0.8 + scalePulse;
        // 让牌面顺着轨道切线方向
        let targetRotY = -currentAngle + Math.PI / 2; 

        // E. C位高光逻辑 (无需 State，直接根据索引判断)
        if (i === closestIndexRef.current) {
             // 目标是 C 位：放大，回正
             targetScale = 1.3;
             targetRotY = Math.atan2(x, z - 8); // 面向镜头
        }

        // F. 姿态平滑过渡 (Lerp)
        // 直接修改 object 的属性，不通过 React props
        cardObj.scale.x = THREE.MathUtils.lerp(cardObj.scale.x, targetScale, delta * 5);
        cardObj.scale.y = THREE.MathUtils.lerp(cardObj.scale.y, targetScale, delta * 5);
        cardObj.scale.z = THREE.MathUtils.lerp(cardObj.scale.z, targetScale, delta * 5);

        // 旋转需要处理一下 2PI 的跳变问题，这里为了简单直接 Lerp，
        // 在高速旋转时可能会有瞬间翻转，但在塔罗场景下通常可以接受
        cardObj.rotation.y = THREE.MathUtils.lerp(cardObj.rotation.y, targetRotY, delta * 5);
    });

    // 更新 Ref 供下一帧对比
    // 注意：这里不需要 setClosestIndex，因为我们已经在循环里直接处理了视觉变化
    closestIndexRef.current = closestIdx;
  });

  return (
    <group ref={groupRef} position={[0, -1, -5]}>
      {orbitData.map((orbit, i) => {
        if (selectedIndices.includes(i)) return null;

        // 初始化位置，实际位置由 useFrame 接管
        // 关键：ref 回调函数，把 Three.js 对象存入数组
        return (
          <group 
            key={i} 
            ref={(el) => (cardRefs.current[i] = el)}
            position={[100, 100, 100]} // 初始放远点，避免第一帧闪烁
          >
            <TarotCard
              index={i}
              data={dummyDeck[i]}
              isRevealed={false}
              position={[0, 0, 0]} 
              backTexture={backTexture}
            />
          </group>
        );
      })}
    </group>
  );
});
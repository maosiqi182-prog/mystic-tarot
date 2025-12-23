// src/components/ShufflingDeck.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// isGathering: true 时，强制所有牌飞向中心
export function ShufflingDeck({ speed, isGathering }) {
  const texture = useTexture('/textures/tarot-back.jpg');
  
  const BOUNDS = { x: 22, y: 14, z: 12 };

  const cardsData = useMemo(() => {
    return new Array(78).fill(0).map((_, i) => ({
      id: i,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * BOUNDS.x, 
        (Math.random() - 0.5) * BOUNDS.y, 
        (Math.random() - 0.5) * BOUNDS.z
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2, 
        (Math.random() - 0.5) * 2, 
        (Math.random() - 0.5) * 0.8
      ).normalize(), 
      rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
    }));
  }, []);

  const groupRef = useRef();
  const smoothedSpeed = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // 平滑速度
    smoothedSpeed.current = THREE.MathUtils.lerp(smoothedSpeed.current, speed, 0.05);
    const energy = Math.min(smoothedSpeed.current, 100) / 100;
    
    // 正常飞行速度
    const moveSpeed = 1.0 + energy * 25.0; 

    groupRef.current.children.forEach((child, i) => {
      const data = cardsData[i];

      if (isGathering) {
        // --- 🌪️ 收束模式 (Gathering Mode) ---
        // 所有牌失去随机性，被强力吸向中心 (0,0,0)
        
        // 1. 位置插值：每一帧都向 (0,0,0) 靠近 10%
        data.position.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        
        // 2. 旋转归零：每一帧都让旋转角度变小，试图变回竖直
        child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, 0, 0.1);
        child.rotation.y = THREE.MathUtils.lerp(child.rotation.y, 0, 0.1);
        child.rotation.z = THREE.MathUtils.lerp(child.rotation.z, 0, 0.1);
        
      } else {
        // --- 🦇 乱飞模式 (Chaos Mode) ---
        data.position.x += data.velocity.x * moveSpeed * delta;
        data.position.y += data.velocity.y * moveSpeed * delta;
        data.position.z += data.velocity.z * moveSpeed * delta;

        // 边界循环
        if (data.position.x > BOUNDS.x / 2) data.position.x -= BOUNDS.x;
        if (data.position.x < -BOUNDS.x / 2) data.position.x += BOUNDS.x;
        if (data.position.y > BOUNDS.y / 2) data.position.y -= BOUNDS.y;
        if (data.position.y < -BOUNDS.y / 2) data.position.y += BOUNDS.y;
        if (data.position.z > BOUNDS.z / 2) data.position.z -= BOUNDS.z;
        if (data.position.z < -BOUNDS.z / 2) data.position.z += BOUNDS.z;

        child.rotateOnAxis(data.rotAxis, delta * (1 + energy * 8));
      }

      child.position.copy(data.position);
    });
    
    // 如果在收束，整体组稍微缩小一点，增加聚拢感
    if (isGathering) {
        groupRef.current.scale.lerp(new THREE.Vector3(0.1, 0.1, 0.1), 0.05);
    } else {
        groupRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={groupRef}>
      {cardsData.map((item, i) => (
        <mesh key={i} position={item.position}>
          <planeGeometry args={[1.2, 2.0]} /> 
          <meshStandardMaterial 
            map={texture} 
            side={THREE.DoubleSide} 
            transparent
            opacity={1} 
          />
        </mesh>
      ))}
    </group>
  );
}
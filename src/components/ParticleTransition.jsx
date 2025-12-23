// src/components/ParticleTransition.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ParticleTransition({ active, progress }) {
  // 1. 增加粒子数量，提升细腻感
  const COUNT = 2500;
  
  const particles = useMemo(() => {
    const temp = [];
    // 2. 全新深空配色方案：深蓝黑、暗金、微量暗紫、星光白
    // 去掉了突兀的亮紫色，更融合背景
    const colors = [
        '#FFD700', // 金
        '#000033', // 深空蓝黑
        '#1A0033', // 极暗紫
        '#FFFFFF', // 白
        '#B8860B'  // 暗金
    ];

    for (let i = 0; i < COUNT; i++) {
      // 银河盘状分布 (更扁平宽广)
      const angle = Math.random() * Math.PI * 2;
      // 半径范围更大 6-18
      const radius = 6 + Math.random() * 12; 
      // 厚度更薄，更像盘子
      const spreadY = (Math.random() - 0.5) * 2.5;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = spreadY;
      
      // 颜色选择偏向深色
      let colorHex = colors[Math.floor(Math.random() * colors.length)];
      // 让金色少一点，作为点缀
      if (Math.random() > 0.8) colorHex = '#FFD700';

      temp.push({
        startPos: new THREE.Vector3(x, y, z),
        randomSpeed: 0.1 + Math.random() * 0.6, // 速度差异更大
        color: new THREE.Color(colorHex)
      });
    }
    return temp;
  }, []);

  const meshRef = useRef();
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    
    particles.forEach((p, i) => {
      positions[i * 3] = p.startPos.x;
      positions[i * 3 + 1] = p.startPos.y;
      positions[i * 3 + 2] = p.startPos.z;
      
      colors[i * 3] = p.color.r;
      colors[i * 3 + 1] = p.color.g;
      colors[i * 3 + 2] = p.color.b;
    });
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [particles]);

  useFrame((state) => {
    if (!meshRef.current || !active) return;
    
    const positions = meshRef.current.geometry.attributes.position.array;
    
    // 使用更平滑的缓动
    const t = progress; 
    const smoothT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    
    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      
      // 目标位置：中心 (0,0,0)
      const currentX = THREE.MathUtils.lerp(p.startPos.x, 0, smoothT);
      const currentY = THREE.MathUtils.lerp(p.startPos.y, 0, smoothT);
      const currentZ = THREE.MathUtils.lerp(p.startPos.z, 0, smoothT);
      
      // 银河旋转：速度慢一点，更优雅
      const spinAngle = smoothT * 6 * p.randomSpeed; 
      
      const cos = Math.cos(spinAngle);
      const sin = Math.sin(spinAngle);
      
      const rotX = currentX * cos - currentZ * sin;
      const rotZ = currentX * sin + currentZ * cos;

      positions[i * 3] = rotX;
      positions[i * 3 + 1] = currentY;
      positions[i * 3 + 2] = rotZ;
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial 
        size={0.1} // 粒子非常细小
        vertexColors 
        transparent 
        // 3. 降低透明度，制造尘埃感
        opacity={0.6} 
        blending={THREE.AdditiveBlending} 
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}
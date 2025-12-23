// src/components/CardParticleTransition.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function CardParticleTransition({ active, progress }) {
  const COUNT = 800;
  const texture = useTexture('/textures/tarot-back.jpg');

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 10; 
      const spreadY = (Math.random() - 0.5) * 6; 

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = spreadY;
      
      temp.push({
        startPos: new THREE.Vector3(x, y, z),
        randomSpeed: 0.5 + Math.random(),
        scale: 0.1 + Math.random() * 0.1 
      });
    }
    return temp;
  }, []);

  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current || !active) return;
    
    // 缓动
    const t = progress;
    const smoothT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    particles.forEach((p, i) => {
      // 1. 位置计算
      // 🎯 关键修正：目标 Y 轴设为 -1，与 DeckFan 的堆叠位置对齐
      const currentX = THREE.MathUtils.lerp(p.startPos.x, 0, smoothT);
      const currentY = THREE.MathUtils.lerp(p.startPos.y, -1.0, smoothT); 
      const currentZ = THREE.MathUtils.lerp(p.startPos.z, 0, smoothT);

      // 2. 漩涡
      const spinAngle = smoothT * 10 * p.randomSpeed;
      const cos = Math.cos(spinAngle);
      const sin = Math.sin(spinAngle);
      const rotX = currentX * cos - currentZ * sin;
      const rotZ = currentX * sin + currentZ * cos;

      dummy.position.set(rotX, currentY, rotZ);

      // 3. 旋转
      const time = state.clock.getElapsedTime();
      dummy.rotation.x = time * p.randomSpeed * 2;
      dummy.rotation.y = time * p.randomSpeed * 2;
      dummy.rotation.z = time * p.randomSpeed * 2;

      // 4. 缩放与消失
      // 在最后阶段 (progress > 0.8) 迅速缩小，看起来像融入了牌堆
      const fadeOut = smoothT > 0.8 ? (1 - smoothT) * 5 : 1;
      const finalScale = p.scale * Math.max(0, fadeOut);
      
      dummy.scale.set(finalScale, finalScale * 1.6, finalScale); 

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y += 0.005;
  });

  if (!active) return null;

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide} 
        transparent={true}
        opacity={0.8}
        depthWrite={false} // 防止遮挡，更像能量体
      />
    </instancedMesh>
  );
}
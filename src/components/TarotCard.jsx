// src/components/TarotCard.jsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const getFileNameByName = (name) => {
  if (!name) return 'maj00';
  const lowerName = name.toLowerCase().trim();
  const majors = { 'the fool': 'maj00', 'the magician': 'maj01', 'the high priestess': 'maj02', 'the empress': 'maj03', 'the emperor': 'maj04', 'the hierophant': 'maj05', 'the lovers': 'maj06', 'the chariot': 'maj07', 'strength': 'maj08', 'the hermit': 'maj09', 'wheel of fortune': 'maj10', 'justice': 'maj11', 'the hanged man': 'maj12', 'death': 'maj13', 'temperance': 'maj14', 'the devil': 'maj15', 'the tower': 'maj16', 'the star': 'maj17', 'the moon': 'maj18', 'the sun': 'maj19', 'judgement': 'maj20', 'the world': 'maj21' };
  if (majors[lowerName]) return majors[lowerName];
  const parts = lowerName.split(' of ');
  if (parts.length < 2) return 'maj00';
  const rankStr = parts[0];
  const suitStr = parts[1];
  let suitPrefix = suitStr;
  if (suitStr === 'pentacles') suitPrefix = 'pents';
  const ranks = { 'ace': '01', 'two': '02', '2': '02', 'three': '03', '3': '03', 'four': '04', '4': '04', 'five': '05', '5': '05', 'six': '06', '6': '06', 'seven': '07', '7': '07', 'eight': '08', '8': '08', 'nine': '09', '9': '09', 'ten': '10', '10': '10', 'page': '11', 'knight': '12', 'queen': '13', 'king': '14' };
  const cardNum = ranks[rankStr] || '01';
  return `${suitPrefix}${cardNum}`;
};

export const TarotCard = React.memo(function TarotCard({ data, position, isRevealed, onHover, onClick, index, backTexture }) {
  if (!data) return null;

  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [frontTexture, setFrontTexture] = useState(null);

  const resources = useMemo(() => {
    return {
      planeGeo: new THREE.PlaneGeometry(1.3, 2.3),
      boxGeo: new THREE.BoxGeometry(1.4, 2.4, 0.02),
      ringGeo: new THREE.RingGeometry(0.64, 0.65, 16),
      
      bodyMat: new THREE.MeshBasicMaterial({ color: '#111' }),
      backMat: new THREE.MeshBasicMaterial({ color: '#1a0b2e' }),
      frontMat: new THREE.MeshBasicMaterial({ color: '#222' }),
      borderMat: new THREE.MeshBasicMaterial({ color: '#FFD700' }),
      hoverMat: new THREE.MeshBasicMaterial({ color: '#FFD700', transparent: true, opacity: 0.3 })
    };
  }, []);

  useMemo(() => resources.ringGeo.rotateZ(Math.PI / 4), [resources]);

  useEffect(() => {
    if (isRevealed && !frontTexture) {
      const loader = new THREE.TextureLoader();
      const fileName = getFileNameByName(data.name);
      loader.load(`/textures/tarot-deck/${fileName}.jpg`, (tex) => { 
        tex.colorSpace = THREE.SRGBColorSpace; 
        tex.minFilter = THREE.LinearFilter; 
        setFrontTexture(tex); 
      });
    }
  }, [isRevealed, data.name]);

  const targetRotationY = isRevealed ? Math.PI : 0;
  const targetRotationZ = (isRevealed && data.isReversed) ? Math.PI : 0;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, delta * 8);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotationZ, delta * 8);
    
    if (position) {
        const hoverOffset = hovered ? 0.2 : 0;
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0], delta * 6);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + hoverOffset, delta * 6);
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, position[2], delta * 6);
    }
  });

  return (
    <group 
      ref={meshRef} 
      position={position ? [position[0], -5, position[2]] : [0,0,0]}
      onPointerOver={() => { setHovered(true); if(onHover) onHover(index); }}
      onPointerOut={() => { setHovered(false); if(onHover) onHover(-1); }}
      onClick={() => { if(onClick) onClick(index); }}
    >
      <mesh geometry={resources.boxGeo} material={resources.bodyMat} />
      
      {/* 修复点：这里原来直接放了 resources.backMat，导致报错。现在改用 primitive 包裹。 */}
      <mesh position={[0, 0, 0.011]} geometry={resources.planeGeo}>
        {backTexture ? 
          <meshBasicMaterial map={backTexture} /> : 
          <primitive object={resources.backMat} attach="material" />
        }
      </mesh>

      {/* 修复点：同上，frontMat 也需要同样的处理 */}
      <mesh position={[0, 0, -0.011]} rotation={[0, Math.PI, 0]} geometry={resources.planeGeo}>
        {frontTexture ? 
          <meshBasicMaterial map={frontTexture} /> : 
          <primitive object={resources.frontMat} attach="material" />
        }
      </mesh>
      
      <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]} geometry={resources.ringGeo} material={resources.borderMat} />

      {hovered && (
        <mesh position={[0, 0, 0]} scale={[1.05, 1.05, 1]} geometry={resources.boxGeo} material={resources.hoverMat} />
      )}
    </group>
  );
});
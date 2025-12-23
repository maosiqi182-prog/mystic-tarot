// src/components/HandController.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export function HandController({ onHandMoved, onHandUpdate, style, showFullSkeleton = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const lastCenterRef = useRef(null);

  const onHandMovedRef = useRef(onHandMoved);
  const onHandUpdateRef = useRef(onHandUpdate);

  useEffect(() => {
    onHandMovedRef.current = onHandMoved;
    onHandUpdateRef.current = onHandUpdate;
  }, [onHandMoved, onHandUpdate]);

  useEffect(() => {
    handsRef.current = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    handsRef.current.setOptions({
      maxNumHands: 1,
      modelComplexity: 0, 
      minDetectionConfidence: 0.6, // 提高一点置信度，减少抖动
      minTrackingConfidence: 0.6
    });

    handsRef.current.onResults(onResults);

    if (videoRef.current) {
      cameraRef.current = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      
      cameraRef.current.start()
        .then(() => setCameraActive(true))
        .catch(err => console.error(err));
    }

    return () => {};
  }, []);

  // 🖐️ 严谨的手指计数算法
  const countExtendedFingers = (landmarks) => {
    const wrist = landmarks[0];
    let count = 0;

    // 拇指 (4)
    const thumbTip = landmarks[4];
    const indexMCP = landmarks[5]; 
    const palmWidth = Math.hypot(landmarks[0].x - landmarks[17].x, landmarks[0].y - landmarks[17].y);
    if (Math.hypot(thumbTip.x - indexMCP.x, thumbTip.y - indexMCP.y) > palmWidth * 0.5) count++;

    // 其他四指：不仅看是否比关节远，还要看是否“远离手心”
    const fingerIndices = [8, 12, 16, 20]; // 指尖
    const mcpIndices = [5, 9, 13, 17];    // 指根关节
    
    for (let i = 0; i < 4; i++) {
        const tip = landmarks[fingerIndices[i]];
        const mcp = landmarks[mcpIndices[i]]; // 使用指根而不是指关节，判断更准
        
        // 计算指尖到手腕的距离 vs 指根到手腕的距离
        const tipToWrist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
        const mcpToWrist = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
        
        // 只有指尖明显延伸出去了才算伸展 (1.2倍)
        if (tipToWrist > mcpToWrist * 1.2) count++;
    }
    return count;
  };

  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    
    if (results.image) {
        ctx.globalAlpha = 0.7;
        ctx.drawImage(results.image, 0, 0, width, height);
        ctx.globalAlpha = 1.0; 
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      const fingers = countExtendedFingers(landmarks);
      
      // 🖐️ 瞄准：必须伸出 4 或 5 根手指 (张开手掌)
      const isHovering = fingers >= 4; 
      
      // ✊ 抓取：必须只剩下 0 或 1 根手指 (拇指可能没握紧，给点容错)
      // 这里的判定比之前更严，半握拳不会触发任何状态
      const isGrabbing = fingers <= 1; 

      if (showFullSkeleton) {
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#FFD700', lineWidth: 2 });
        drawLandmarks(ctx, landmarks, { color: '#FFFFFF', lineWidth: 1, radius: 2 });
      } else {
        // 只有在明确状态下才画点，中间态不画，提示用户手势不标准
        if (isHovering || isGrabbing) {
            const indexTip = landmarks[8];
            const x = indexTip.x * width;
            const y = indexTip.y * height;

            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = isGrabbing ? '#FF0000' : '#00FFFF'; 
            ctx.fill();
            ctx.shadowColor = isGrabbing ? '#FF0000' : '#00FFFF';
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
      }
      
      const wrist = landmarks[0];
      const indexTip = landmarks[8];

      if (lastCenterRef.current) {
        const dist = Math.hypot(wrist.x - lastCenterRef.current.x, wrist.y - lastCenterRef.current.y);
        if (onHandMovedRef.current) {
            onHandMovedRef.current(dist * 1200);
        }
      }
      lastCenterRef.current = wrist;

      if (onHandUpdateRef.current) {
          onHandUpdateRef.current(indexTip.x - 0.5, indexTip.y - 0.5, isGrabbing, isHovering);
      }

    } else {
       if (onHandMovedRef.current) onHandMovedRef.current(0);
    }
    ctx.restore();
  };

  return (
    <div style={{...style, background: 'rgba(0,0,0,0.3)', overflow: 'hidden', borderRadius: '12px'}}>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ width: '100%', height: '100%' }} />
      {!cameraActive && <div style={{color:'#fff', fontSize:'10px', padding:'10px', textAlign:'center'}}>Connecting...</div>}
    </div>
  );
}
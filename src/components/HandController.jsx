import React, { useEffect, useRef, useState } from 'react';

// 🔥 修复关键：加上 'export' 关键字，变成具名导出
// 这样 App.jsx 里的 import { HandController } 就能找到它了！
export function HandController({ onHandMoved, onHandUpdate, showFullSkeleton, style }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  
  // 加载状态，防止 React 抢跑
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  // 1. 检测 SDK 是否加载完毕
  useEffect(() => {
    const checkSdk = () => {
      if (window.Hands && window.Camera) {
        setIsSdkLoaded(true);
        return true;
      }
      return false;
    };

    if (checkSdk()) return;

    const timerId = setInterval(() => {
      if (checkSdk()) {
        clearInterval(timerId);
      }
    }, 100);

    return () => clearInterval(timerId);
  }, []);

  // 2. 初始化逻辑
  useEffect(() => {
    if (!isSdkLoaded) return;

    const Hands = window.Hands;
    const Camera = window.Camera;

    try {
        handsRef.current = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        handsRef.current.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        handsRef.current.onResults(onResults);

        if (videoRef.current) {
          cameraRef.current = new Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          cameraRef.current.start();
        }
    } catch (error) {
        console.error("MediaPipe 初始化失败:", error);
    }

    return () => {
      if (handsRef.current) try { handsRef.current.close(); } catch(e){}
      if (cameraRef.current) try { cameraRef.current.stop(); } catch(e){}
    };
  }, [isSdkLoaded, onHandMoved, onHandUpdate, showFullSkeleton]);

  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    
    if (showFullSkeleton) {
        canvasCtx.drawImage(results.image, 0, 0, width, height);
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const indexFingerTip = landmarks[8];
      
      const x = (0.5 - indexFingerTip.x) * 2; 
      const y = (0.5 - indexFingerTip.y) * 2;

      const thumbTip = landmarks[4];
      const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexFingerTip.x, 2) + 
          Math.pow(thumbTip.y - indexFingerTip.y, 2)
      );
      
      const isGrabbing = distance < 0.05;
      
      if (onHandUpdate) onHandUpdate(x, y, isGrabbing, true);
      if (onHandMoved) onHandMoved(Math.abs(x) * 50);

      if (showFullSkeleton && window.drawConnectors && window.drawLandmarks) {
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
          window.drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});
      }
    } else {
        if (onHandUpdate) onHandUpdate(0, 0, false, false);
    }
    canvasCtx.restore();
  };

  return (
    <div style={{ position: 'relative', ...style }}>
      <video ref={videoRef} style={{ display: 'none' }} playsInline />
      <canvas ref={canvasRef} width={640} height={480} style={{ width: '100%', height: '100%', transform: 'scaleX(-1)', opacity: showFullSkeleton ? 0.8 : 0 }} />
    </div>
  );
}
// 🔥 注意：这里底部不再有 export default HandController; 了
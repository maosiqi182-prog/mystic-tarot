import React, { useEffect, useRef, useState } from 'react';

export function HandController({ onHandMoved, onHandUpdate, showFullSkeleton, style }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const [statusText, setStatusText] = useState("正在连接 AI 服务器...");
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  // 🔥 新增：用于控制更新频率的“节流阀”
  const lastUpdateRef = useRef(0);

  // 1. 等待 SDK 加载 (保持不变)
  useEffect(() => {
    const checkSdk = () => {
      if (window.Hands && window.Camera && window.drawConnectors && window.drawLandmarks) {
        setIsSdkLoaded(true);
        setStatusText("AI 组件已就绪，正在启动...");
        return true;
      }
      return false;
    };
    if (checkSdk()) return;
    let attempts = 0;
    const timerId = setInterval(() => {
      attempts++;
      if (checkSdk()) clearInterval(timerId);
      else if (attempts > 40) {
        setStatusText("网络连接超时，请刷新页面重试");
        clearInterval(timerId);
      }
    }, 500);
    return () => clearInterval(timerId);
  }, []);

  // 2. 初始化 (保持不变)
  useEffect(() => {
    if (!isSdkLoaded) return;
    const Hands = window.Hands;
    const Camera = window.Camera;
    try {
        handsRef.current = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
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
              if (handsRef.current) await handsRef.current.send({ image: videoRef.current });
            },
            width: 640,
            height: 480
          });
          setStatusText("正在请求摄像头权限...");
          cameraRef.current.start().then(() => setStatusText("")).catch(err => setStatusText(`摄像头启动失败: ${err.message}`));
        }
    } catch (error) {
        console.error("Init Error:", error);
        setStatusText(`初始化错误: ${error.message}`);
    }
    return () => {
      if (handsRef.current) try { handsRef.current.close(); } catch(e){}
      if (cameraRef.current) try { cameraRef.current.stop(); } catch(e){}
    };
  }, [isSdkLoaded]);

  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvasCtx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    
    // 绘制半透明视频背景
    canvasCtx.globalAlpha = 0.5; 
    canvasCtx.drawImage(results.image, 0, 0, width, height);
    canvasCtx.globalAlpha = 1.0;

    const now = Date.now();
    let handDetected = false;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      handDetected = true;
      if (statusText !== "") setStatusText("");

      const landmarks = results.multiHandLandmarks[0];

      // 🔥 解决频闪的关键：每 60ms 才向父组件汇报一次状态
      if (now - lastUpdateRef.current > 60) {
          const indexFingerTip = landmarks[8];
          const x = (0.5 - indexFingerTip.x) * 2; 
          const y = (0.5 - indexFingerTip.y) * 2;
          const thumbTip = landmarks[4];
          const distance = Math.sqrt(Math.pow(thumbTip.x - indexFingerTip.x, 2) + Math.pow(thumbTip.y - indexFingerTip.y, 2));
          const isGrabbing = distance < 0.05;
          
          if (onHandUpdate) onHandUpdate(x, y, isGrabbing, true);
          if (onHandMoved) onHandMoved(Math.abs(x) * 50);
          
          lastUpdateRef.current = now; // 更新上次汇报时间
      }

      // 🔥 美化骨架：使用神秘的青色和白色
      if (window.drawConnectors && window.drawLandmarks) {
          // 连线：半透明青色
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {color: 'rgba(0, 255, 255, 0.6)', lineWidth: 2});
          // 关节外圈：青色光晕
          window.drawLandmarks(canvasCtx, landmarks, {color: '#00FFFF', lineWidth: 2, radius: 4});
          // 关节核心：纯白色
          window.drawLandmarks(canvasCtx, landmarks, {color: '#FFFFFF', lineWidth: 0, radius: 2});
      }
    } else {
        // 没检测到手，也需要节流汇报
        if (now - lastUpdateRef.current > 60) {
            if (onHandUpdate) onHandUpdate(0, 0, false, false);
            lastUpdateRef.current = now;
        }
    }
    canvasCtx.restore();
  };

  const boxStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '200px',
    height: '150px',
    zIndex: 9999,
    border: '1px solid rgba(0, 255, 255, 0.3)', // 改成青色边框
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#00FFFF', // 改成青色文字
    fontSize: '12px',
    pointerEvents: 'none',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)', // 加一点青色发光
    ...style
  };

  return (
    <div style={boxStyle}>
      {statusText && (
        <div style={{ position: 'absolute', padding: '10px', textAlign: 'center', width: '100%', zIndex: 10 }}>
          {statusText}
        </div>
      )}
      <video ref={videoRef} style={{ display: 'none' }} playsInline />
      <canvas ref={canvasRef} width={640} height={480} style={{ width: '100%', height: '100%', transform: 'scaleX(-1)' }} />
    </div>
  );
}

export default HandController;
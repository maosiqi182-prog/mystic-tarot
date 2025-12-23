import React, { useEffect, useRef, useState } from 'react';

export function HandController({ onHandMoved, onHandUpdate, showFullSkeleton, style }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [statusMsg, setStatusMsg] = useState("等待 AI 组件..."); // 新增状态显示

  // 1. 检测 SDK
  useEffect(() => {
    const checkSdk = () => {
      if (window.Hands && window.Camera) {
        setIsSdkLoaded(true);
        setStatusMsg("AI 组件就绪，启动中...");
        return true;
      }
      return false;
    };
    if (checkSdk()) return;
    const timerId = setInterval(() => {
      if (checkSdk()) clearInterval(timerId);
    }, 500); // 改为 500ms 检查一次
    return () => clearInterval(timerId);
  }, []);

  // 2. 初始化
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
          cameraRef.current.start()
            .then(() => setStatusMsg("")) // 启动成功后清空文字
            .catch(err => setStatusMsg("摄像头启动失败: " + err.message));
        }
    } catch (error) {
        console.error("Init Error:", error);
        setStatusMsg("初始化出错: " + error.message);
    }

    return () => {
      if (handsRef.current) try { handsRef.current.close(); } catch(e){}
      if (cameraRef.current) try { cameraRef.current.stop(); } catch(e){}
    };
  }, [isSdkLoaded]);

  const onResults = (results) => {
    if (!canvasRef.current) return;
    const canvasCtx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    
    // 强制绘制视频画面，确保留下影像
    canvasCtx.drawImage(results.image, 0, 0, width, height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setStatusMsg("检测到手势！"); // 调试信息
      const landmarks = results.multiHandLandmarks[0];
      const indexFingerTip = landmarks[8];
      const x = (0.5 - indexFingerTip.x) * 2; 
      const y = (0.5 - indexFingerTip.y) * 2;
      const thumbTip = landmarks[4];
      const distance = Math.sqrt(Math.pow(thumbTip.x - indexFingerTip.x, 2) + Math.pow(thumbTip.y - indexFingerTip.y, 2));
      const isGrabbing = distance < 0.05;
      
      if (onHandUpdate) onHandUpdate(x, y, isGrabbing, true);
      if (onHandMoved) onHandMoved(Math.abs(x) * 50);

      // 强制画骨架，不管参数如何
      if (window.drawConnectors && window.drawLandmarks) {
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
          window.drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});
      }
    } else {
        // 如果没检测到手，显示提示
        if(statusMsg === "") setStatusMsg("请举起手...");
        if (onHandUpdate) onHandUpdate(0, 0, false, false);
    }
    canvasCtx.restore();
  };

  // 🔥 调试样式：强制红色边框、黑色背景、最高层级
  const debugStyle = {
    position: 'fixed', // 强制固定在屏幕上
    bottom: '20px',
    right: '20px',
    width: '200px',
    height: '150px',
    zIndex: 9999, // 确保在最顶层
    border: '3px solid red', // 红色边框
    backgroundColor: 'rgba(0,0,0,0.5)', // 半透明黑底
    color: 'white',
    fontSize: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none', // 让鼠标可以穿透它去点后面的牌
    ...style
  };

  return (
    <div style={debugStyle}>
      {statusMsg && <div style={{position:'absolute', zIndex:10, textShadow:'1px 1px 0 #000'}}>{statusMsg}</div>}
      <video ref={videoRef} style={{ display: 'none' }} playsInline />
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        style={{ 
            width: '100%', 
            height: '100%', 
            transform: 'scaleX(-1)',
            opacity: 1 // 强制不透明
        }} 
      />
    </div>
  );
}

export default HandController;
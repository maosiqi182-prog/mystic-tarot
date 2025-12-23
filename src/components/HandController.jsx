import React, { useEffect, useRef, useState } from 'react';

export function HandController({ onHandMoved, onHandUpdate, showFullSkeleton, style }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  
  // 状态显示：让我们知道它卡在哪一步
  const [statusText, setStatusText] = useState("正在连接 AI 服务器...");
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  // 1. 等待 index.html 里的脚本加载完成
  useEffect(() => {
    const checkSdk = () => {
      // 检查所有必要的组件是否存在
      if (window.Hands && window.Camera && window.drawConnectors && window.drawLandmarks) {
        setIsSdkLoaded(true);
        setStatusText("AI 组件已就绪，正在启动...");
        return true;
      }
      return false;
    };

    if (checkSdk()) return;
    
    // 每 500 毫秒检查一次，最多检查 20 秒
    let attempts = 0;
    const timerId = setInterval(() => {
      attempts++;
      if (checkSdk()) {
        clearInterval(timerId);
      } else if (attempts > 40) {
        setStatusText("网络连接超时，请刷新页面重试");
        clearInterval(timerId);
      }
    }, 500);

    return () => clearInterval(timerId);
  }, []);

  // 2. 初始化摄像头和 AI
  useEffect(() => {
    if (!isSdkLoaded) return;

    const Hands = window.Hands;
    const Camera = window.Camera;

    try {
        handsRef.current = new Hands({
          locateFile: (file) => {
            // 使用更稳定的 CDN 地址
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
          
          setStatusText("正在请求摄像头权限...");
          
          cameraRef.current.start()
            .then(() => {
              setStatusText(""); // 启动成功，清空文字
            })
            .catch(err => {
              setStatusText(`摄像头启动失败: ${err.message}`);
            });
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
    
    // 1. 绘制视频画面 (半透明，营造科技感)
    canvasCtx.globalAlpha = 0.6; 
    canvasCtx.drawImage(results.image, 0, 0, width, height);
    canvasCtx.globalAlpha = 1.0;

    // 2. 检测手势
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // 只要检测到手，就清空提示文字
      if (statusText !== "") setStatusText("");

      const landmarks = results.multiHandLandmarks[0];
      const indexFingerTip = landmarks[8];
      
      const x = (0.5 - indexFingerTip.x) * 2; 
      const y = (0.5 - indexFingerTip.y) * 2;
      
      const thumbTip = landmarks[4];
      const distance = Math.sqrt(Math.pow(thumbTip.x - indexFingerTip.x, 2) + Math.pow(thumbTip.y - indexFingerTip.y, 2));
      const isGrabbing = distance < 0.05;
      
      if (onHandUpdate) onHandUpdate(x, y, isGrabbing, true);
      if (onHandMoved) onHandMoved(Math.abs(x) * 50);

      if (window.drawConnectors && window.drawLandmarks) {
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
          window.drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});
      }
    } else {
        // 没检测到手时的提示
        // 只有当摄像头已经启动了才提示举手
        if (!statusText) {
             // 可以在这里画一行小字 "请举手"，或者保持清爽
        }
        if (onHandUpdate) onHandUpdate(0, 0, false, false);
    }
    canvasCtx.restore();
  };

  // 🔥 样式修复：回到右上角，去除红框，改用半透明黑底
  const boxStyle = {
    position: 'fixed',
    top: '20px',    // 回到右上角
    right: '20px',  // 回到右上角
    width: '200px',
    height: '150px',
    zIndex: 9999,
    border: '1px solid rgba(255, 255, 255, 0.3)', // 微弱的白边
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 半透明黑底
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontSize: '12px',
    pointerEvents: 'none', // 允许点击穿透
    ...style
  };

  return (
    <div style={boxStyle}>
      {/* 状态文字显示层 */}
      {statusText && (
        <div style={{
          position: 'absolute',
          padding: '10px',
          textAlign: 'center',
          width: '100%',
          zIndex: 10
        }}>
          {statusText}
        </div>
      )}
      
      <video ref={videoRef} style={{ display: 'none' }} playsInline />
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        style={{ 
            width: '100%', 
            height: '100%', 
            transform: 'scaleX(-1)', // 镜像翻转
        }} 
      />
    </div>
  );
}

export default HandController;
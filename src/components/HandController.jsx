import React, { useEffect, useRef } from 'react';
// 🔥 关键修改 1：把整个模块都引进来，而不是只引用 Hands
import * as HandsModule from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

function HandController({ onHandMoved, onHandUpdate, showFullSkeleton, style }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    // 🔥 关键修改 2：动态查找构造函数
    // 这行代码会自动判断：如果是在本地，用 HandsModule.Hands；如果是在打包环境，尝试 HandsModule.default.Hands
    const Hands = HandsModule.Hands || HandsModule.default?.Hands;

    // 安全检查，防止崩溃
    if (!Hands) {
        console.error("❌ 无法加载 MediaPipe Hands 类，可能是打包问题。");
        return;
    }

    // 初始化 MediaPipe Hands
    handsRef.current = new Hands({
      locateFile: (file) => {
        // 🔥 关键修改 3：使用 CDN 加载模型文件
        // 这能解决 Vercel 上找不到 .wasm 或 .data 文件的问题，防止 "Context Lost"
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

    return () => {
      if (handsRef.current) handsRef.current.close();
      if (cameraRef.current) cameraRef.current.stop();
    };
  }, [onHandMoved, onHandUpdate, showFullSkeleton]);

  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    
    // 如果需要显示骨架
    if (showFullSkeleton) {
        canvasCtx.drawImage(results.image, 0, 0, width, height);
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // 获取食指指尖 (Index Finger Tip - ID 8)
      const indexFingerTip = landmarks[8];
      
      // 计算相对移动
      const x = (0.5 - indexFingerTip.x) * 2; // 映射到 -1 到 1
      const y = (0.5 - indexFingerTip.y) * 2;

      // 判断抓取手势 (通过计算指尖距离)
      // 拇指(4) 和 食指(8)
      const thumbTip = landmarks[4];
      const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexFingerTip.x, 2) + 
          Math.pow(thumbTip.y - indexFingerTip.y, 2)
      );
      
      // 距离小于 0.05 算捏合/抓取
      const isGrabbing = distance < 0.05;
      
      // 回传数据给父组件
      if (onHandUpdate) {
          // 这里传入 isGrabbing 状态
          // 同时也传入 hovering 状态（只要检测到手就算 hovering）
          onHandUpdate(x, y, isGrabbing, true);
      }

      // 计算洗牌速度 (简单模拟：根据X轴移动速度)
      // 实际应用中可以保存上一帧位置来计算 delta
      if (onHandMoved) {
          onHandMoved(Math.abs(x) * 50);
      }

      // 绘制简单的点提示位置
      if (showFullSkeleton) {
          drawConnectors(canvasCtx, landmarks, HandsModule.HAND_CONNECTIONS || HandsModule.default?.HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
          drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});
      }
    } else {
        // 没有检测到手，通知父组件
        if (onHandUpdate) {
            onHandUpdate(0, 0, false, false);
        }
    }
    canvasCtx.restore();
  };

  // 辅助绘图函数 (如果没有引入 drawing_utils)
  const drawLandmarks = (ctx, landmarks, style) => {
      ctx.fillStyle = style.color;
      for(const lm of landmarks) {
          ctx.beginPath();
          ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, style.lineWidth * 2, 0, 2 * Math.PI);
          ctx.fill();
      }
  }

  const drawConnectors = (ctx, landmarks, connections, style) => {
      if(!connections) return;
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.lineWidth;
      for(const conn of connections) {
          const p1 = landmarks[conn[0]];
          const p2 = landmarks[conn[1]];
          ctx.beginPath();
          ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
          ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
          ctx.stroke();
      }
  }

  return (
    <div style={{ position: 'relative', ...style }}>
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ 
            width: '100%', 
            height: '100%', 
            transform: 'scaleX(-1)', // 镜像翻转
            opacity: showFullSkeleton ? 0.8 : 0 // 不显示骨架时完全透明
        }}
      />
    </div>
  );
}

export default HandController;
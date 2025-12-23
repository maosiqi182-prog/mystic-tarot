// src/utils/LayoutEngine.js

// 这是一个纯数学文件，负责计算牌的位置

export const SPREADS = {
  // 1. 单张牌阵 (用于简单的是非题)
  SINGLE: {
    name: "One Card (Yes/No)",
    count: 1,
    getPositions: () => [
      [0, 0, 0] // 正中间
    ]
  },

  // 2. 时间流牌阵 (过去、现在、未来)
  TIME_FLOW: {
    name: "Time Flow (Past, Present, Future)",
    count: 3,
    getPositions: () => [
      [-2.5, 0, 0], // 左边 (过去)
      [0, 0, 0],    // 中间 (现在)
      [2.5, 0, 0]   // 右边 (未来)
    ]
  },

  // 3. 恋人金字塔 (4张牌)
  LOVE_PYRAMID: {
    name: "Love Pyramid",
    count: 4,
    getPositions: () => [
      [0, -1.5, 0],   // 1. 自己 (下方)
      [-2, 0.5, 0],   // 2. 对方 (左上)
      [2, 0.5, 0],    // 3. 关系 (右上)
      [0, 2, 0]       // 4. 未来 (顶端)
    ]
  }
};

// 辅助函数：根据牌阵名称获取所有坐标
export const getSpreadLayout = (spreadName) => {
  const spread = SPREADS[spreadName] || SPREADS.SINGLE;
  return spread.getPositions();
};
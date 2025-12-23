// src/utils/QuestionMapping.js

import React from 'react';

export const QUESTION_CATEGORIES = [
  {
    id: 'daily',
    name: '今日运势',
    description: '探索今天的能量与指引',
    icon: '🌟'
  },
  {
    id: 'love',
    name: '爱情关系',
    description: '洞察感情发展的可能性',
    icon: '❤️'
  },
  {
    id: 'career',
    name: '事业发展',
    description: '分析工作与职业的机遇',
    icon: '💼'
  },
  {
    id: 'decision',
    name: '抉择指引',
    description: '在两个选项中寻找方向',
    icon: '⚖️'
  }
];

export const getSpreadByType = (type) => {
  switch (type) {
    case 'daily':
      return { name: '单张牌阵', cardCount: 1 };
    case 'love':
    case 'decision':
      return { name: '二择一牌阵', cardCount: 2 };
    case 'career':
      return { name: '圣三角牌阵', cardCount: 3 };
    default:
      return { name: '自由牌阵', cardCount: 3 };
  }
};
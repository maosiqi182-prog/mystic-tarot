// src/utils/QuestionMapping.js

// 这里定义用户看到的问题类型，以及它们对应的幕后牌阵
export const QUESTION_CATEGORIES = [
  {
    id: 'daily',
    label: '今日指引 (Daily Guidance)',
    description: '获取今日的能量重点与建议。',
    spreadType: 'SINGLE' // 对应 LayoutEngine 里的 SINGLE
  },
  {
    id: 'love',
    label: '情感关系 (Love & Relationships)',
    description: '洞察当前关系的状态与未来走向。',
    spreadType: 'LOVE_PYRAMID' // 对应 LayoutEngine 里的 LOVE_PYRAMID
  },
  {
    id: 'career',
    label: '事业发展 (Career Path)',
    description: '分析过去、现在的基础与未来的机遇。',
    spreadType: 'TIME_FLOW' // 对应 LayoutEngine 里的 TIME_FLOW
  },
  // 你可以在这里继续添加更多类型...
];

// 辅助函数：根据类别ID找到对应的牌阵类型
export const getSpreadByType = (categoryId) => {
  const category = QUESTION_CATEGORIES.find(c => c.id === categoryId);
  return category ? category.spreadType : 'SINGLE';
};
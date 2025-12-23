// src/utils/tarotMeanings.js

const meanings = {
  // --- 大阿卡纳 (Major Arcana) ---
  'maj00': { 
    name: "The Fool", nameCN: "愚人",
    upright: { keywords: "New Beginnings, Freedom, Innocence", keywordsCN: "新的开始, 自由, 天真", desc: "Trust your instincts and take a leap of faith.", descCN: "相信你的直觉，踏上未知的旅程。" }, 
    reversed: { keywords: "Recklessness, Risk", keywordsCN: "鲁莽, 风险, 疏忽", desc: "Look before you leap.", descCN: "行动前请三思，不要盲目冒险。" } 
  },
  'maj01': { name: "The Magician", nameCN: "魔术师", upright: { keywords: "Manifestation, Power", keywordsCN: "创造力, 显化, 意志" }, reversed: { keywords: "Manipulation, Trickery", keywordsCN: "欺骗, 混乱, 才能未展" } },
  'maj02': { name: "The High Priestess", nameCN: "女祭司", upright: { keywords: "Intuition, Mystery", keywordsCN: "直觉, 神秘, 潜意识" }, reversed: { keywords: "Secrets, Withdrawn", keywordsCN: "秘密, 忽视直觉" } },
  'maj03': { name: "The Empress", nameCN: "皇后", upright: { keywords: "Fertility, Nature", keywordsCN: "丰饶, 母性, 创造力" }, reversed: { keywords: "Dependence, Blocked", keywordsCN: "依赖, 缺乏关爱" } },
  'maj04': { name: "The Emperor", nameCN: "皇帝", upright: { keywords: "Authority, Structure", keywordsCN: "权威, 结构, 控制" }, reversed: { keywords: "Tyranny, Rigidity", keywordsCN: "暴政, 滥用权力" } },
  'maj05': { name: "The Hierophant", nameCN: "教皇", upright: { keywords: "Tradition, Beliefs", keywordsCN: "传统, 信仰, 指引" }, reversed: { keywords: "Rebellion, Freedom", keywordsCN: "叛逆, 打破常规" } },
  'maj06': { name: "The Lovers", nameCN: "恋人", upright: { keywords: "Love, Choices", keywordsCN: "爱, 和谐, 抉择" }, reversed: { keywords: "Disharmony, Imbalance", keywordsCN: "不和谐, 矛盾" } },
  'maj07': { name: "The Chariot", nameCN: "战车", upright: { keywords: "Victory, Willpower", keywordsCN: "胜利, 决心, 征服" }, reversed: { keywords: "Lack of Control", keywordsCN: "失控, 缺乏方向" } },
  'maj08': { name: "Strength", nameCN: "力量", upright: { keywords: "Courage, Patience", keywordsCN: "力量, 勇气, 耐心" }, reversed: { keywords: "Weakness, Doubt", keywordsCN: "软弱, 自疑" } },
  'maj09': { name: "The Hermit", nameCN: "隐士", upright: { keywords: "Introspection, Solitude", keywordsCN: "内省, 孤独, 探索" }, reversed: { keywords: "Isolation, Withdrawal", keywordsCN: "孤立, 逃避" } },
  'maj10': { name: "Wheel of Fortune", nameCN: "命运之轮", upright: { keywords: "Luck, Karma, Cycles", keywordsCN: "命运, 转折, 机遇" }, reversed: { keywords: "Bad Luck, Resistance", keywordsCN: "厄运, 阻力" } },
  'maj11': { name: "Justice", nameCN: "正义", upright: { keywords: "Justice, Truth", keywordsCN: "正义, 公平, 真相" }, reversed: { keywords: "Unfairness, Dishonesty", keywordsCN: "不公, 偏见" } },
  'maj12': { name: "The Hanged Man", nameCN: "倒吊人", upright: { keywords: "Surrender, Perspective", keywordsCN: "牺牲, 等待, 新视角" }, reversed: { keywords: "Stalling, Resistance", keywordsCN: "徒劳, 挣扎" } },
  'maj13': { name: "Death", nameCN: "死神", upright: { keywords: "Endings, Change", keywordsCN: "结束, 转变, 重生" }, reversed: { keywords: "Resistance to Change", keywordsCN: "抗拒改变, 停滞" } },
  'maj14': { name: "Temperance", nameCN: "节制", upright: { keywords: "Balance, Patience", keywordsCN: "平衡, 节制, 治愈" }, reversed: { keywords: "Imbalance, Excess", keywordsCN: "失衡, 过度" } },
  'maj15': { name: "The Devil", nameCN: "恶魔", upright: { keywords: "Addiction, Materialism", keywordsCN: "束缚, 诱惑, 欲望" }, reversed: { keywords: "Detachment, Freedom", keywordsCN: "释放, 挣脱" } },
  'maj16': { name: "The Tower", nameCN: "高塔", upright: { keywords: "Disaster, Upheaval", keywordsCN: "灾难, 剧变, 崩塌" }, reversed: { keywords: "Averting Disaster", keywordsCN: "勉强维持, 恐惧改变" } },
  'maj17': { name: "The Star", nameCN: "星星", upright: { keywords: "Hope, Inspiration", keywordsCN: "希望, 灵感, 疗愈" }, reversed: { keywords: "Despair, Discouragement", keywordsCN: "绝望, 缺乏信心" } },
  'maj18': { name: "The Moon", nameCN: "月亮", upright: { keywords: "Illusion, Fear", keywordsCN: "幻觉, 不安, 潜意识" }, reversed: { keywords: "Release of Fear", keywordsCN: "迷惘, 混乱" } },
  'maj19': { name: "The Sun", nameCN: "太阳", upright: { keywords: "Joy, Success", keywordsCN: "快乐, 成功, 活力" }, reversed: { keywords: "Sadness, Temporary", keywordsCN: "暂时的消沉" } },
  'maj20': { name: "Judgement", nameCN: "审判", upright: { keywords: "Judgement, Rebirth", keywordsCN: "审判, 复活, 觉醒" }, reversed: { keywords: "Self-Doubt, Refusal", keywordsCN: "自我怀疑, 拒绝改变" } },
  'maj21': { name: "The World", nameCN: "世界", upright: { keywords: "Completion, Travel", keywordsCN: "完成, 圆满, 成就" }, reversed: { keywords: "Incompletion, Stagnation", keywordsCN: "未完成, 缺憾" } }
};

const getCardIdByName = (name) => {
  if (!name) return 'maj00';
  const lowerName = name.toLowerCase();
  const majorMap = Object.keys(meanings).reduce((acc, key) => {
    acc[meanings[key].name.toLowerCase()] = key;
    return acc;
  }, {});
  return majorMap[lowerName] || 'minor_arcana';
};

// 简单的获取含义函数
export const getCardMeaning = (cardName, isReversed = false, language = 'en') => {
  if (!cardName) return { title: "", keywords: "", description: "", orientation: "" };
  
  const id = getCardIdByName(cardName);
  const isCN = language === 'cn';

  // 1. 大阿卡纳
  if (meanings[id]) {
    const data = isReversed ? meanings[id].reversed : meanings[id].upright;
    return {
      title: isCN ? meanings[id].nameCN : meanings[id].name,
      keywords: isCN ? (data.keywordsCN || data.keywords) : data.keywords,
      description: isCN ? (data.descCN || data.desc) : data.desc,
      orientation: isCN ? (isReversed ? "逆位" : "正位") : (isReversed ? "Reversed" : "Upright")
    };
  }

  // 2. 小阿卡纳 (简易处理，防止报错)
  return {
    title: cardName,
    keywords: isCN ? "小阿卡纳" : "Minor Arcana",
    description: isCN ? "揭示生活中的具体细节。" : "Reveals details of daily life.",
    orientation: isCN ? (isReversed ? "逆位" : "正位") : (isReversed ? "Reversed" : "Upright")
  };
};
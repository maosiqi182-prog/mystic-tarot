// src/utils/questions.js

export const questions = [
  {
    id: 'q_focus',
    text: '请在心中默念你的问题，然后告诉塔罗牌：你现在最想关注的是什么？',
    options: [
      { text: '当下的处境与挑战', value: 'current', nextQuestion: null },
      { text: '未来的发展趋势', value: 'future', nextQuestion: null },
      { text: '内心深处的指引', value: 'inner', nextQuestion: null }
    ]
  },
  // 你可以在这里添加更多问题
];
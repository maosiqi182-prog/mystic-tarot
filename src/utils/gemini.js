// src/utils/gemini.js
// DeepSeek 官方付费版 - 强力防报错模式

const API_KEY = import.meta.env.VITE_TAROT_API_KEY;
// 官方代理路径
const API_URL = "/deepseek/chat/completions"; 

// 🔥 这一行必须有 export，报错就是因为缺了这个
export async function getTarotReading(question, spreadType, cards, positions, language = 'cn') {
  if (!API_KEY) {
    console.error("❌ 未找到 API Key，请检查 .env 文件");
    return null;
  }

  // 1. 整理牌面
  const cardsDescription = cards.map((card, index) => {
      const posName = language === 'cn' ? (positions[index]?.cn || '指引位') : (positions[index]?.en || 'Guide');
      const cardName = card.name;
      const orientation = card.isReversed ? (language === 'cn' ? "逆位" : "Reversed") : (language === 'cn' ? "正位" : "Upright");
      return `${index + 1}. [${posName}]: ${cardName} (${orientation})`;
  }).join('\n');

  // 2. 提示词
  const systemPrompt = "你是一位神秘、富有同理心且洞察力极强的塔罗牌大师。你的解读风格优雅、深邃，能够直击人心。请务必以 JSON 格式返回结果。";

  let userPrompt = `
      请根据用户的提问和抽出的牌阵进行解读。
      
      【用户信息】
      用户问题: "${question}"
      牌阵类型: ${spreadType}
      
      【牌面信息】
      ${cardsDescription}
      
      【要求】
      1. 结合牌意、位置、正逆位和用户的问题进行深度分析。
      2. 请直接返回一个纯 JSON 格式的数据，不要包含 markdown 标记。
      3. JSON 必须包含一个 "readings" 数组，数组里每一项对应一张牌的解读文案（纯文本字符串）。
      
      返回格式示例：
      {
        "readings": [
           "这里写第一张牌的分析文字...",
           "这里写第二张牌的分析文字...",
           "这里写第三张牌的分析文字..."
        ]
      }
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 1.0, 
        response_format: { type: "json_object" } 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API 报错:", errorData);
      return null;
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const jsonResult = JSON.parse(text);

    // 🔥 防止 "Objects are not valid" 报错
    const safeReadings = jsonResult.readings.map(item => {
        if (typeof item === 'object') {
            return item.interpretation || item.analysis || item.description || JSON.stringify(item);
        }
        return String(item);
    });
    
    return { readings: safeReadings };

  } catch (error) {
    console.error("AI 请求失败:", error);
    return null;
  }
}
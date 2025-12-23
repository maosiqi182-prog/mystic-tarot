// src/utils/tarotData.js
import { v4 as uuidv4 } from 'uuid';

const MAJOR_ARCANA_NAMES = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

const SUITS = ['cups', 'pents', 'swords', 'wands']; 

const padNumber = (num) => String(num).padStart(2, '0');

export const generateDeck = () => {
  const deck = [];
  
  // 1. 生成大阿卡纳
  MAJOR_ARCANA_NAMES.forEach((name, index) => {
    const fileName = `maj${padNumber(index)}.jpg`;
    deck.push({
      id: uuidv4(),
      name: name,
      type: 'major',
      suit: null,
      texturePath: `/textures/tarot-deck/${fileName}`, 
      description: `The standard meaning of ${name}.` 
    });
  });

  // 2. 生成小阿卡纳
  SUITS.forEach(suit => {
    for (let i = 1; i <= 14; i++) {
      const fileName = `${suit}${padNumber(i)}.jpg`;
      let displaySuit = suit.charAt(0).toUpperCase() + suit.slice(1);
      if (suit === 'pents') displaySuit = 'Pentacles'; // 修正星币名字

      let rank = String(i);
      if (i === 1) rank = 'Ace';
      if (i === 11) rank = 'Page';
      if (i === 12) rank = 'Knight';
      if (i === 13) rank = 'Queen';
      if (i === 14) rank = 'King';

      deck.push({
        id: uuidv4(),
        name: `${rank} of ${displaySuit}`,
        type: 'minor',
        suit: suit,
        texturePath: `/textures/tarot-deck/${fileName}`,
        description: `The meaning of ${rank} of ${displaySuit}.`
      });
    }
  });

  return deck;
};
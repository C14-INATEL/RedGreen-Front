export const TABLE_COLORS = [
  'White',
  'Black',
  'Red',
  'Green',
  'Blue',
  'Yellow',
  'Purple',
  'Diamond',
  'Platinum',
  'Gold',
  'Silver',
  'Bronze',
] as const;

export type TableColor = (typeof TABLE_COLORS)[number];

export const COLOR_OPTIONS = [
  { Value: 'White', Hex: '#FFFFFF', Label: 'Branco' },
  { Value: 'Black', Hex: '#2D2D2D', Label: 'Preto' },
  { Value: 'Red', Hex: '#FF5050', Label: 'Vermelho' },
  { Value: 'Green', Hex: '#3CD278', Label: 'Verde' },
  { Value: 'Blue', Hex: '#508CFF', Label: 'Azul' },
  { Value: 'Yellow', Hex: '#FFD700', Label: 'Amarelo' },
  { Value: 'Purple', Hex: '#B450FF', Label: 'Roxo' },
  { Value: 'Diamond', Hex: '#7DF9FF', Label: 'Diamante' },
  { Value: 'Platinum', Hex: '#E5E4E2', Label: 'Platina' },
  { Value: 'Gold', Hex: '#FFC107', Label: 'Ouro' },
  { Value: 'Silver', Hex: '#C0C0C0', Label: 'Prata' },
  { Value: 'Bronze', Hex: '#CD7F32', Label: 'Bronze' },
] as const;

export const TABLE_COLOR_MAP: Record<
  TableColor,
  { hex: string; glow: string; bg: string; border: string }
> = {
  White: {
    hex: '#FFFFFF',
    glow: 'rgba(255,255,255,0.55)',
    bg: 'rgba(255,255,255,0.10)',
    border: 'rgba(255,255,255,0.45)',
  },
  Black: {
    hex: '#2D2D2D',
    glow: 'rgba(45,45,45,0.55)',
    bg: 'rgba(45,45,45,0.10)',
    border: 'rgba(45,45,45,0.45)',
  },
  Red: {
  hex: '#FF5050',
  glow: 'rgba(255,80,80,0.55)',
  bg: 'rgba(255,80,80,0.10)',
  border: 'rgba(255,80,80,0.45)',
},
  Green: {
    hex: '#3CD278',
    glow: 'rgba(60,210,120,0.55)',
    bg: 'rgba(60,210,120,0.10)',
    border: 'rgba(60,210,120,0.45)',
  },
  Blue: { 
    hex: '#508CFF',
    glow: 'rgba(80,140,255,0.55)',
    bg: 'rgba(80,140,255,0.10)',
    border: 'rgba(80,140,255,0.45)',
  },
  Yellow: {
  hex: '#FFF200',
  glow: 'rgba(255,242,0,0.65)',
  bg: 'rgba(255,242,0,0.10)',
  border: 'rgba(255,242,0,0.50)',
},

Gold: {
  hex: '#D4AF37',
  glow: 'rgba(212,175,55,0.65)',
  bg: 'rgba(212,175,55,0.10)',
  border: 'rgba(212,175,55,0.50)',
},
  Purple: {
    hex: '#800080',
    glow: 'rgba(128,0,128,0.55)',
    bg: 'rgba(128,0,128,0.10)',
    border: 'rgba(128,0,128,0.45)',
  },
  Diamond: {
    hex: '#7DF9FF',
    glow: 'rgba(125,249,255,0.55)',
    bg: 'rgba(125,249,255,0.10)',
    border: 'rgba(125,249,255,0.45)',
  },
  Platinum: {
  hex: '#D9D9D9',
  glow: 'rgba(217,217,217,0.65)',
  bg: 'rgba(217,217,217,0.10)',
  border: 'rgba(217,217,217,0.50)',
},
  Silver: {
  hex: '#C4C4C4',
  glow: 'rgba(168,176,184,0.65)',
  bg: 'rgba(168,176,184,0.10)',
  border: 'rgba(168,176,184,0.50)',
},
  Bronze: {
    hex: '#CD7F32',
    glow: 'rgba(205,127,50,0.55)',
    bg: 'rgba(205,127,50,0.10)',
    border: 'rgba(205,127,50,0.45)',
  },
};
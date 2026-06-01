// Centraliza os paths usados nas rotas para evitar strings soltas
export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  slotmachineroom: '/slot-machine-room',
  gambitRoom: '/gambit-room',
  legacyGambitRoom: '/minefield-room',
  rouletteRoom: '/roulette-room',
} as const;

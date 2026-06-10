// Centraliza os paths usados nas rotas para evitar strings soltas
export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  slotmachineroom: '/slot-machine-room',
  slotmachinetables: '/slotmachine-tables',
  minefieldRoom: '/minefield-room',
  minefieldTablesRoom: '/minefield-tables',
  rouletteRoom: '/roulette-room',
} as const;

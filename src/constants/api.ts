// API constants

export const API_ENDPOINTS = {
  mainnet: {
    base: 'https://api.endur.fi',
    graphql: 'https://api.endur.fi/graphql',
  },
  testnet: {
    base: 'https://api-testnet.endur.fi',
    graphql: 'https://api-testnet.endur.fi/graphql',
  },
  devnet: {
    base: 'http://localhost:3000',
    graphql: 'http://localhost:3000/graphql',
  },
} as const;

export const API_ROUTES = {
  USER_INFO: '/user',
  LEADERBOARD: '/leaderboard',
  PORTFOLIO: '/portfolio',
  POINTS: '/points',
  ALLOCATION: '/allocation',
  STATUS: '/status',
} as const;

export const DEFAULT_API_TIMEOUT = 10000; // 10 seconds
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second 
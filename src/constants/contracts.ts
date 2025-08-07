// Contract constants

export const CONTRACTS = {
  mainnet: {
    lst: '0x042b8fadd4661b33dbe1c6857992c3c7c12c3f0c',
    delegator: '0x042b8fadd4661b33dbe1c6857992c3c7c12c3f0c',
    withdrawalQueue: '0x042b8fadd4661b33dbe1c6857992c3c7c12c3f0c',
    strk: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  },
  testnet: {
    lst: '0x042b8fadd4661b33dbe1c6857992c3c7c12c3f0c',
    delegator: '0x042b8fadd4661b33dbe1c6857992c3c7c12c3f0c',
    withdrawalQueue: '0x042b8fadd4661b33dbe1c6857992c3c7c12c3f0c',
    strk: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  },
  devnet: {
    lst: '0x042b8fadd4661b33dbe1c6857992c3c7c12c3f0c',
    delegator: '0x042b8fadd4661b33dbe1c6857992c3c7c12c3f0c',
    withdrawalQueue: '0x042b8fadd4661b33dbe1c6857992c3c7c12c3f0c',
    strk: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  },
} as const;

export const CONTRACT_NAMES = {
  LST: 'lst',
  DELEGATOR: 'delegator',
  WITHDRAWAL_QUEUE: 'withdrawalQueue',
  STRK: 'strk',
} as const; 
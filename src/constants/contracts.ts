// Contract constants

import { Network } from "../types";

export const CONTRACTS: Record<Network, {
  lst: string;
  withdrawalQueue: string;
  strk: string;
}> = {
  mainnet: {
    lst: '0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a',
    withdrawalQueue: '0x518a66e579f9eb1603f5ffaeff95d3f013788e9c37ee94995555026b9648b6',
    strk: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  },
  testnet: {
    lst: '0x0',
    withdrawalQueue: '0x0',
    strk: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  }
} as const;

export const CONTRACT_NAMES = {
  LST: 'lst',
  DELEGATOR: 'delegator',
  WITHDRAWAL_QUEUE: 'withdrawalQueue',
  STRK: 'strk',
} as const; 
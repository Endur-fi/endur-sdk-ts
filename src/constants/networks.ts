// Network constants
import type { NetworkConfig } from '../types';

export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'Starknet Mainnet',
    chainId: '0x534e5f4d41494e',
    rpcUrl: 'https://alpha-mainnet.starknet.io',
    explorerUrl: 'https://starkscan.co',
  },
  testnet: {
    name: 'Starknet Testnet',
    chainId: '0x534e5f474f45524c49',
    rpcUrl: 'https://alpha4.starknet.io',
    explorerUrl: 'https://testnet.starkscan.co',
  },
  devnet: {
    name: 'Starknet Devnet',
    chainId: '0x534e5f474f45524c49',
    rpcUrl: 'http://127.0.0.1:5050',
    explorerUrl: 'http://127.0.0.1:5050',
  },
};

export const DEFAULT_NETWORK = 'mainnet';
export const DEFAULT_TIMEOUT = 30000; // 30 seconds 
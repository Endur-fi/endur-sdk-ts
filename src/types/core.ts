// Core SDK types

import { Account, RpcProvider } from "starknet";

export type Network = 'mainnet' | 'testnet';

export interface SDKConfig {
  /** Starknet network (mainnet, testnet, etc.) */
  network: Network;
  /** API base URL */
  apiUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

export interface SDKOptions {
  /** Configuration object */
  config: SDKConfig;
  /** Starknet provider instance */
  provider: RpcProvider;
  /** Account instance */
  account?: Account;
}

export interface NetworkConfig {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiResponse<T = any> extends SuccessResponse<T> {
  timestamp: number;
  requestId?: string;
}

export type Result<T, E = ErrorResponse> = 
  | { success: true; data: T }
  | { success: false; error: E }; 
// Holdings types for protocol integrations

import { BlockIdentifier } from "starknet";

export interface ProtocolHoldings {
  xSTRKAmount: string;
  STRKAmount: string;
}

export interface ProtocolConfig {
  name: string;
  contractAddress: string;
  deploymentBlock: number;
  maxBlock?: number; // For contracts that were upgraded
  abi: any;
}

export interface ProtocolPosition {
  id: string;
  type: 'lst' | 'lp' | 'vault' | 'farm' | 'trove';
  amount: string;
  value: string;
  apy?: number;
  metadata?: Record<string, any>;
}

export interface ProtocolMetadata {
  totalSupply?: string;
  totalAssets?: string;
  exchangeRate?: string;
  apy?: number;
  fees?: string;
}

export interface HoldingsRequest {
  address: string;
  provider: any;
  blockNumber?: BlockIdentifier;
  protocol?: string; // Specific protocol to query
}

export interface HoldingsResponse {
  success: boolean;
  data?: ProtocolHoldings;
  error?: string;
  protocol: string;
  timestamp: number;
}

export interface MultiProtocolHoldings {
  total: ProtocolHoldings;
  byProtocol: Record<string, ProtocolHoldings>;
  protocols: string[];
}

export type ProtocolType = 
  | 'lst' 
  | 'ekubo' 
  | 'nostraLending' 
  | 'nostraDex' 
  | 'opus' 
  | 'strkfarm' 
  | 'strkfarmEkubo'
  | 'vesu';

export interface ProtocolInfo {
  type: ProtocolType;
  name: string;
  description: string;
  isActive: boolean;
  supportedNetworks: string[];
} 
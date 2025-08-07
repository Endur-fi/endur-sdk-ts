// Starknet types

export interface ContractAddress {
  address: string;
  classHash?: string;
}

export interface TransactionOptions {
  maxFee?: string;
  nonce?: number;
  version?: number;
}

export interface CallData {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

export interface TransactionResult {
  transactionHash: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  blockNumber?: number;
  blockHash?: string;
}

export interface EventFilter {
  fromBlock?: number;
  toBlock?: number;
  address?: string;
  keys?: string[];
}

export interface Event {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  address: string;
  keys: string[];
  data: string[];
}

export interface BlockInfo {
  blockNumber: number;
  blockHash: string;
  timestamp: number;
  parentHash: string;
  sequencerAddress: string;
} 
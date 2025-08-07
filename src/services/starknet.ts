// Starknet service
import type { 
  CallData, 
  TransactionOptions, 
  TransactionResult, 
  EventFilter, 
  Event, 
  BlockInfo 
} from '../types';
import { isValidStarknetAddress, isValidHexString } from '../utils';

export class StarknetService {
  private provider: any;
  private account: any;
  private network: string;

  constructor(provider?: any, account?: any, network: string = 'mainnet') {
    this.provider = provider;
    this.account = account;
    this.network = network;
  }

  /**
   * Sets the provider
   */
  setProvider(provider: any): void {
    this.provider = provider;
  }

  /**
   * Sets the account
   */
  setAccount(account: any): void {
    this.account = account;
  }

  /**
   * Gets the current network
   */
  getNetwork(): string {
    return this.network;
  }

  /**
   * Calls a contract function
   */
  async callContract(callData: CallData): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not set');
    }

    if (!isValidStarknetAddress(callData.contractAddress)) {
      throw new Error('Invalid contract address');
    }

    try {
      const result = await this.provider.callContract({
        contractAddress: callData.contractAddress,
        entrypoint: callData.entrypoint,
        calldata: callData.calldata,
      });
      return result;
    } catch (error) {
      throw new Error(`Contract call failed: ${error}`);
    }
  }

  /**
   * Executes a transaction
   */
  async executeTransaction(calls: CallData[], options?: TransactionOptions): Promise<TransactionResult> {
    if (!this.account) {
      throw new Error('Account not set');
    }

    try {
      const result = await this.account.execute(calls, undefined, options);
      return {
        transactionHash: result.transaction_hash,
        status: 'PENDING',
      };
    } catch (error) {
      throw new Error(`Transaction execution failed: ${error}`);
    }
  }

  /**
   * Gets transaction status
   */
  async getTransactionStatus(transactionHash: string): Promise<TransactionResult> {
    if (!this.provider) {
      throw new Error('Provider not set');
    }

    if (!isValidHexString(transactionHash)) {
      throw new Error('Invalid transaction hash');
    }

    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      return {
        transactionHash,
        status: receipt.status,
        blockNumber: receipt.block_number,
        blockHash: receipt.block_hash,
      };
    } catch (error) {
      throw new Error(`Failed to get transaction status: ${error}`);
    }
  }

  /**
   * Gets events
   */
  async getEvents(filter: EventFilter): Promise<Event[]> {
    if (!this.provider) {
      throw new Error('Provider not set');
    }

    try {
      const events = await this.provider.getEvents(filter);
      return events.map((event: any) => ({
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
        blockHash: event.block_hash,
        address: event.from_address,
        keys: event.keys,
        data: event.data,
      }));
    } catch (error) {
      throw new Error(`Failed to get events: ${error}`);
    }
  }

  /**
   * Gets block information
   */
  async getBlockInfo(blockNumber?: number): Promise<BlockInfo> {
    if (!this.provider) {
      throw new Error('Provider not set');
    }

    try {
      const block = await this.provider.getBlock(blockNumber || 'latest');
      return {
        blockNumber: block.block_number,
        blockHash: block.block_hash,
        timestamp: block.timestamp,
        parentHash: block.parent_block_hash,
        sequencerAddress: block.sequencer_address,
      };
    } catch (error) {
      throw new Error(`Failed to get block info: ${error}`);
    }
  }

  /**
   * Gets the current block number
   */
  async getBlockNumber(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not set');
    }

    try {
      const block = await this.provider.getBlock('latest');
      return block.block_number;
    } catch (error) {
      throw new Error(`Failed to get block number: ${error}`);
    }
  }

  /**
   * Gets account balance
   */
  async getBalance(address: string, tokenAddress?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not set');
    }

    if (!isValidStarknetAddress(address)) {
      throw new Error('Invalid address');
    }

    try {
      const balance = await this.provider.getBalance(address, tokenAddress);
      return balance.balance;
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }
} 
// LST service
import type { CallData, TransactionOptions, TransactionResult } from '../types';
import { CONTRACTS } from '../constants';
import { isValidStarknetAddress } from '../utils';

export class LSTService {
  private starknetService: any;
  private network: string;

  constructor(starknetService: any, network: string = 'mainnet') {
    this.starknetService = starknetService;
    this.network = network;
  }

  /**
   * Gets the LST contract address for the current network
   */
  private getLSTAddress(): string {
    return CONTRACTS[this.network as keyof typeof CONTRACTS]?.lst || '';
  }

  /**
   * Gets the delegator contract address for the current network
   */
  private getDelegatorAddress(): string {
    return CONTRACTS[this.network as keyof typeof CONTRACTS]?.delegator || '';
  }

  /**
   * Gets the withdrawal queue contract address for the current network
   */
  private getWithdrawalQueueAddress(): string {
    return CONTRACTS[this.network as keyof typeof CONTRACTS]?.withdrawalQueue || '';
  }

  /**
   * Deposits ETH to get LST tokens
   */
  async deposit(amount: string, options?: TransactionOptions): Promise<TransactionResult> {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error('Invalid LST contract address');
    }

    const callData: CallData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: 'deposit',
      calldata: [amount],
    };

    return this.starknetService.executeTransaction([callData], options);
  }

  /**
   * Deposits ETH with a referral code
   */
  async depositWithReferral(
    amount: string, 
    referralCode: string, 
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error('Invalid LST contract address');
    }

    const callData: CallData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: 'deposit_with_referral',
      calldata: [amount, referralCode],
    };

    return this.starknetService.executeTransaction([callData], options);
  }

  /**
   * Mints LST tokens
   */
  async mint(amount: string, options?: TransactionOptions): Promise<TransactionResult> {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error('Invalid LST contract address');
    }

    const callData: CallData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: 'mint',
      calldata: [amount],
    };

    return this.starknetService.executeTransaction([callData], options);
  }

  /**
   * Redeems LST tokens for ETH
   */
  async redeem(amount: string, options?: TransactionOptions): Promise<TransactionResult> {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error('Invalid LST contract address');
    }

    const callData: CallData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: 'redeem',
      calldata: [amount],
    };

    return this.starknetService.executeTransaction([callData], options);
  }

  /**
   * Gets the exchange rate between ETH and LST
   */
  async getExchangeRate(): Promise<string> {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error('Invalid LST contract address');
    }

    const callData: CallData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: 'get_exchange_rate',
      calldata: [],
    };

    const result = await this.starknetService.callContract(callData);
    return result.result[0];
  }

  /**
   * Gets the total supply of LST tokens
   */
  async getTotalSupply(): Promise<string> {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error('Invalid LST contract address');
    }

    const callData: CallData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: 'total_supply',
      calldata: [],
    };

    const result = await this.starknetService.callContract(callData);
    return result.result[0];
  }

  /**
   * Gets the balance of LST tokens for an address
   */
  async getBalance(address: string): Promise<string> {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error('Invalid LST contract address');
    }

    if (!isValidStarknetAddress(address)) {
      throw new Error('Invalid address');
    }

    const callData: CallData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: 'balance_of',
      calldata: [address],
    };

    const result = await this.starknetService.callContract(callData);
    return result.result[0];
  }

  /**
   * Stakes LST tokens through the delegator
   */
  async stake(amount: string, options?: TransactionOptions): Promise<TransactionResult> {
    if (!isValidStarknetAddress(this.getDelegatorAddress())) {
      throw new Error('Invalid delegator contract address');
    }

    const callData: CallData = {
      contractAddress: this.getDelegatorAddress(),
      entrypoint: 'stake',
      calldata: [amount],
    };

    return this.starknetService.executeTransaction([callData], options);
  }

  /**
   * Unstakes LST tokens through the delegator
   */
  async unstake(amount: string, options?: TransactionOptions): Promise<TransactionResult> {
    if (!isValidStarknetAddress(this.getDelegatorAddress())) {
      throw new Error('Invalid delegator contract address');
    }

    const callData: CallData = {
      contractAddress: this.getDelegatorAddress(),
      entrypoint: 'unstake',
      calldata: [amount],
    };

    return this.starknetService.executeTransaction([callData], options);
  }

  /**
   * Requests withdrawal from the withdrawal queue
   */
  async requestWithdrawal(amount: string, options?: TransactionOptions): Promise<TransactionResult> {
    if (!isValidStarknetAddress(this.getWithdrawalQueueAddress())) {
      throw new Error('Invalid withdrawal queue contract address');
    }

    const callData: CallData = {
      contractAddress: this.getWithdrawalQueueAddress(),
      entrypoint: 'request_withdrawal',
      calldata: [amount],
    };

    return this.starknetService.executeTransaction([callData], options);
  }

  /**
   * Claims withdrawal from the withdrawal queue
   */
  async claimWithdrawal(requestId: string, options?: TransactionOptions): Promise<TransactionResult> {
    if (!isValidStarknetAddress(this.getWithdrawalQueueAddress())) {
      throw new Error('Invalid withdrawal queue contract address');
    }

    const callData: CallData = {
      contractAddress: this.getWithdrawalQueueAddress(),
      entrypoint: 'claim_withdrawal',
      calldata: [requestId],
    };

    return this.starknetService.executeTransaction([callData], options);
  }
} 
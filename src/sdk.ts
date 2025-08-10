// Main SDK class
import type { SDKOptions, SDKConfig } from './types';
import { ApiService } from './services/api';
import { StarknetService } from './services/starknet';
import { LSTService } from './services/lst';
import { HoldingsManager } from './services/holdings-manager';
import { DEFAULT_NETWORK, DEFAULT_TIMEOUT } from './constants';
import { Account, RpcProvider } from 'starknet';

export class EndurSDK {
  public api: ApiService;
  public starknet: StarknetService;
  public lst: LSTService;
  public holdings: HoldingsManager;
  private config: SDKConfig;

  constructor(options: SDKOptions) {
    this.config = {
      timeout: DEFAULT_TIMEOUT,
      network: options.config.network,
    };

    // Initialize services
    this.api = new ApiService(this.config.network, this.config.timeout);
    this.starknet = new StarknetService(
      options.provider,
      options.account,
      this.config.network
    );
    this.lst = new LSTService(this.starknet, this.config.network);
    this.holdings = new HoldingsManager(options);
  }

  /**
   * Gets the current configuration
   */
  getConfig(): SDKConfig {
    return { ...this.config };
  }

  /**
   * Updates the configuration
   */
  updateConfig(newConfig: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize services if network changed
    if (newConfig.network && newConfig.network !== this.config.network) {
      this.api = new ApiService(this.config.network, this.config.timeout);
      this.starknet = new StarknetService(
        this.starknet['provider'],
        this.starknet['account'],
        this.config.network
      );
      this.lst = new LSTService(this.starknet, this.config.network);
      this.holdings.updateNetwork(this.config.network!);
    }
  }

  /**
   * Sets the Starknet provider
   */
  setProvider(provider: RpcProvider): void {
    this.starknet.setProvider(provider);
    this.holdings.setProvider(provider);
  }

  /**
   * Sets the Starknet account
   */
  setAccount(account: Account): void {
    this.starknet.setAccount(account);
  }

  /**
   * Gets the current network
   */
  getNetwork(): string {
    return this.config.network || DEFAULT_NETWORK;
  }

  /**
   * Checks if the SDK is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.network;
  }

  /**
   * Gets SDK version
   */
  getVersion(): string {
    return '1.0.0';
  }
} 
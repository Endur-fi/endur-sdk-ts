// Main SDK class
import type { SDKOptions, SDKConfig } from './types';
import { ApiService } from './services/api';
import { StarknetService } from './services/starknet';
import { LSTService } from './services/lst';
import { DEFAULT_NETWORK, DEFAULT_TIMEOUT } from './constants';

export class EndurSDK {
  public api: ApiService;
  public starknet: StarknetService;
  public lst: LSTService;
  private config: SDKConfig;

  constructor(options: SDKOptions = {}) {
    this.config = {
      network: DEFAULT_NETWORK,
      timeout: DEFAULT_TIMEOUT,
      ...options.config,
    };

    // Initialize services
    this.api = new ApiService(this.config.network, this.config.timeout);
    this.starknet = new StarknetService(
      options.provider,
      options.account,
      this.config.network
    );
    this.lst = new LSTService(this.starknet, this.config.network);
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
    }
  }

  /**
   * Sets the Starknet provider
   */
  setProvider(provider: any): void {
    this.starknet.setProvider(provider);
  }

  /**
   * Sets the Starknet account
   */
  setAccount(account: any): void {
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
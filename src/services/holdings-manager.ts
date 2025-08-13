// Holdings manager service
import type { 
  HoldingsRequest, 
  HoldingsResponse, 
  MultiProtocolHoldings,
  ProtocolType,
  ProtocolInfo,
  SDKOptions,
  ProtocolHoldings
} from '../types';
import { LSTHoldingsService } from './protocols/lst';
import { EkuboHoldingsService } from './protocols/ekubo';
import { NostraLendingHoldingsService } from './protocols/nostraLending';
import { NostraDexHoldingsService } from './protocols/nostraDex';
import { OpusHoldingsService } from './protocols/opus';
import { STRKFarmEkuboHoldingsService, STRKFarmSenseiHoldingsService } from './protocols/strkfarm';
import { VesuHoldingsService } from './protocols/vesu';

export class HoldingsManager {
  private services: Map<ProtocolType, any>;
  private network: string;
  private provider: any;
  private sdkConfig: SDKOptions;
  constructor(config: SDKOptions) {
    this.network = config.config.network;
    this.provider = config.provider;
    this.sdkConfig = config;
    this.services = new Map();

    // Initialize all protocol services
    this.services.set('lst', new LSTHoldingsService(config));
    this.services.set('ekubo', new EkuboHoldingsService(config));
    this.services.set('nostraLending', new NostraLendingHoldingsService(config));
    this.services.set('nostraDex', new NostraDexHoldingsService(config));
    this.services.set('opus', new OpusHoldingsService(config));
    this.services.set('strkfarm', new STRKFarmSenseiHoldingsService(config));
    this.services.set('strkfarmEkubo', new STRKFarmEkuboHoldingsService(config));
    this.services.set('vesu', new VesuHoldingsService(config));
  }

  /**
   * Sets the provider for all services
   */
  setProvider(provider: any): void {
    this.provider = provider;
    this.services.forEach(service => {
      service.setProvider(provider);
    });
  }

  /**
   * Gets holdings for a specific protocol
   */
  async getProtocolHoldings(
    protocol: ProtocolType,
    request: HoldingsRequest
  ): Promise<HoldingsResponse> {
    const service = this.services.get(protocol);
    if (!service) {
      return {
        success: false,
        error: `Protocol ${protocol} not supported`,
        protocol,
        timestamp: Date.now(),
      };
    }

    return service.getHoldings(request);
  }

  /**
   * Gets holdings for multiple protocols
   */
  async getMultiProtocolHoldings(
    request: HoldingsRequest,
    protocols: ProtocolType[] = ['lst', 'ekubo', 'nostraLending', 'nostraDex', 'opus', 'strkfarm', 'strkfarmEkubo', 'vesu']
  ): Promise<MultiProtocolHoldings> {
    const byProtocol: Record<ProtocolType, ProtocolHoldings> = {
      lst: { xSTRKAmount: '0', STRKAmount: '0' },
      ekubo: { xSTRKAmount: '0', STRKAmount: '0' },
      nostraLending: { xSTRKAmount: '0', STRKAmount: '0' },
      nostraDex: { xSTRKAmount: '0', STRKAmount: '0' },
      opus: { xSTRKAmount: '0', STRKAmount: '0' },
      strkfarm: { xSTRKAmount: '0', STRKAmount: '0' },
      strkfarmEkubo: { xSTRKAmount: '0', STRKAmount: '0' },
      vesu: { xSTRKAmount: '0', STRKAmount: '0' },
    };
    let total = { xSTRKAmount: '0', STRKAmount: '0' };

    const promises = protocols.map(async (protocol) => {
      let retry = 0;
      const MAX_RETRIES = 1;
      while (retry < MAX_RETRIES) {
        try {
          const response = await this.getProtocolHoldings(protocol, request);
          if (response.success && response.data) {
            byProtocol[protocol] = response.data;
            total.xSTRKAmount = (BigInt(total.xSTRKAmount) + BigInt(response.data.xSTRKAmount)).toString();
            total.STRKAmount = (BigInt(total.STRKAmount) + BigInt(response.data.STRKAmount)).toString();
          } else {
            byProtocol[protocol] = { xSTRKAmount: '0', STRKAmount: '0' };
          }
        } catch (error) { 
          retry++;
          if (retry < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 10000 * retry));
          } else {
            throw error;
          }
        }
      }
    });

    await Promise.all(promises);

    return {
      total,
      byProtocol,
      protocols,
    };
  }

  /**
   * Gets all available protocols
   */
  getAvailableProtocols(): ProtocolInfo[] {
    return [
      {
        type: 'lst',
        name: 'LST',
        description: 'Liquid Staking Token protocol',
        isActive: true,
        supportedNetworks: ['mainnet', 'testnet'],
      },
      {
        type: 'ekubo',
        name: 'Ekubo',
        description: 'Concentrated liquidity AMM',
        isActive: true,
        supportedNetworks: ['mainnet', 'testnet'],
      },
      {
        type: 'nostraLending',
        name: 'Nostra Lending',
        description: 'Lending and borrowing protocol',
        isActive: true,
        supportedNetworks: ['mainnet', 'testnet'],
      },
      {
        type: 'nostraDex',
        name: 'Nostra Dex',
        description: 'Dex protocol',
        isActive: true,
        supportedNetworks: ['mainnet', 'testnet'],
      },
      {
        type: 'opus',
        name: 'Opus',
        description: 'CDP and lending protocol',
        isActive: true,
        supportedNetworks: ['mainnet', 'testnet'],
      },
      {
        type: 'strkfarm',
        name: 'STRKFarm',
        description: 'Yield farming protocol',
        isActive: true,
        supportedNetworks: ['mainnet', 'testnet'],
      },
      {
        type: 'vesu',
        name: 'Vesu',
        description: 'DeFi protocol with vaults and collateral',
        isActive: true,
        supportedNetworks: ['mainnet', 'testnet'],
      },
    ];
  }

  /**
   * Gets a specific protocol service
   */
  getProtocolService(protocol: ProtocolType): any {
    return this.services.get(protocol);
  }

  /**
   * Updates network for all services
   */
  updateNetwork(network: string): void {
    this.network = network;
    this.services.clear();
    
    // Reinitialize services with new network
    this.services.set('lst', new LSTHoldingsService(this.sdkConfig));
    this.services.set('ekubo', new EkuboHoldingsService(this.sdkConfig));
    this.services.set('nostraLending', new NostraLendingHoldingsService(this.sdkConfig));
    this.services.set('nostraDex', new NostraDexHoldingsService(this.sdkConfig));
    this.services.set('opus', new OpusHoldingsService(this.sdkConfig));
    this.services.set('strkfarm', new STRKFarmSenseiHoldingsService(this.sdkConfig));
    this.services.set('strkfarmEkubo', new STRKFarmEkuboHoldingsService(this.sdkConfig));
    this.services.set('vesu', new VesuHoldingsService(this.sdkConfig));

    // Set provider for all services
    if (this.provider) {
      this.setProvider(this.provider);
    }
  }

  /**
   * Gets the current network
   */
  getNetwork(): string {
    return this.network;
  }
} 
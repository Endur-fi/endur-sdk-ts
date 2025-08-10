// Base holdings service
import { BlockIdentifier, RpcProvider } from 'starknet';
import type { 
  ProtocolHoldings, 
  ProtocolConfig, 
  HoldingsRequest, 
  HoldingsResponse,
  MultiProtocolHoldings,
  SDKOptions
} from '../types';
import { isValidStarknetAddress } from '../utils';

export abstract class BaseHoldingsService {
  protected provider: RpcProvider;
  protected sdkConfig: SDKOptions;

  constructor(config: SDKOptions) {
    this.sdkConfig = config;
    this.provider = config.provider;
  }

  /**
   * Sets the provider
   */
  setProvider(provider: RpcProvider): void {
    this.provider = provider;
  }

  /**
   * Checks if a contract is deployed at a given block
   */
  protected isContractDeployed(
    blockNumber: BlockIdentifier = 'pending',
    deploymentBlock: number,
    maxBlock?: number
  ): boolean {
    const lowerCondition =
      Number.isInteger(blockNumber) &&
      (blockNumber as number) < deploymentBlock;

    const upperCondition =
      maxBlock &&
      ((blockNumber as number) > maxBlock ||
        blockNumber === "latest" ||
          blockNumber === "pending" ||
          !blockNumber);

    return !(lowerCondition || upperCondition);
  }

  /**
   * Creates zero holdings
   */
  protected createZeroHoldings(): ProtocolHoldings {
    return {
      xSTRKAmount: '0',
      STRKAmount: '0',
    };
  }

  /**
   * Validates address
   */
  protected validateAddress(address: string): void {
    if (!isValidStarknetAddress(address)) {
      throw new Error('Invalid address provided');
    }
  }

  /**
   * Validates provider
   */
  protected validateProvider(): void {
    if (!this.provider) {
      throw new Error('Provider not set');
    }
  }

  /**
   * Adds two holdings together
   */
  protected addHoldings(a: ProtocolHoldings, b: ProtocolHoldings): ProtocolHoldings {
    return {
      xSTRKAmount: (BigInt(a.xSTRKAmount) + BigInt(b.xSTRKAmount)).toString(),
      STRKAmount: (BigInt(a.STRKAmount) + BigInt(b.STRKAmount)).toString(),
    };
  }

  /**
   * Multiplies holdings by a factor
   */
  protected multiplyHoldings(holdings: ProtocolHoldings, factor: string): ProtocolHoldings {
    return {
      xSTRKAmount: (BigInt(holdings.xSTRKAmount) * BigInt(factor)).toString(),
      STRKAmount: (BigInt(holdings.STRKAmount) * BigInt(factor)).toString(),
    };
  }

  /**
   * Abstract method to get holdings for a specific protocol
   */
  abstract getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;

  /**
   * Gets holdings for multiple protocols
   */
  async getMultiProtocolHoldings(
    request: HoldingsRequest,
    protocols: string[]
  ): Promise<MultiProtocolHoldings> {
    const byProtocol: Record<string, ProtocolHoldings> = {};
    let total = this.createZeroHoldings();

    for (const protocol of protocols) {
      try {
        const response = await this.getHoldings({ ...request, protocol });
        if (response.success && response.data) {
          byProtocol[protocol] = response.data;
          total = this.addHoldings(total, response.data);
        } else {
          byProtocol[protocol] = this.createZeroHoldings();
        }
      } catch (error) {
        console.error(`Error fetching holdings for ${protocol}:`, error);
        byProtocol[protocol] = this.createZeroHoldings();
      }
    }

    return {
      total,
      byProtocol,
      protocols,
    };
  }
} 
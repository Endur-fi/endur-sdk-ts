// Ekubo holdings service
import axios from 'axios';
import { BlockIdentifier, Contract, RpcProvider } from 'starknet';
import { BaseHoldingsService } from '../holdings';
import type { HoldingsRequest, HoldingsResponse, ProtocolHoldings, SDKOptions } from '../../types';
import EkuboPositionAbi from '../../abis/ekubo.position.abi.json';

// Ekubo configuration
const EKUBO_CONFIG = {
  mainnet: {
    xSTRKAddress: '0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a',
    positionAddress: '0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067',
    deploymentBlock: 165388,
    apiUrl: 'https://mainnet-api.ekubo.org',
  },
  testnet: {
    xSTRKAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    positionAddress: '0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067',
    deploymentBlock: 165388,
    apiUrl: 'https://testnet-api.ekubo.org',
  },
};

interface EkuboPosition {
  id: string;
  pool_key: {
    token0: string;
    token1: string;
  };
  bounds: {
    lower: number;
    upper: number;
  };
}

export class EkuboHoldingsService extends BaseHoldingsService {
  private config: typeof EKUBO_CONFIG.mainnet;

  constructor(config: SDKOptions) {
    super(config);
    this.config = EKUBO_CONFIG[config.config.network as keyof typeof EKUBO_CONFIG] || EKUBO_CONFIG.mainnet;
  }

  async getHoldings(request: HoldingsRequest): Promise<HoldingsResponse> {
    try {
      this.validateProvider();
      this.validateAddress(request.address);

      const { address, blockNumber } = request;
      const holdings = await this.getEkuboHoldings(address, blockNumber);

      return {
        success: true,
        data: holdings,
        protocol: 'ekubo',
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        protocol: 'ekubo',
        timestamp: Date.now(),
      };
    }
  }

  private async getEkuboHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    if (!this.isContractDeployed(blockNumber, this.config.deploymentBlock)) {
      return this.createZeroHoldings();
    }

    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);

    try {
      // Fetch positions from Ekubo API
      const response = await axios.get(
        `${this.config.apiUrl}/positions/${address}?showClosed=true`,
        {
          headers: {
            Host: this.config.apiUrl.replace('https://', ''),
          },
        }
      );

      const positions: EkuboPosition[] = response.data?.data || [];

      // Filter positions that contain xSTRK
      const xSTRKPositions = positions.filter(
        (position) =>
          position.pool_key.token0 === this.config.xSTRKAddress ||
          position.pool_key.token1 === this.config.xSTRKAddress
      );

      const positionContract = new Contract(
        EkuboPositionAbi,
        this.config.positionAddress,
        this.provider
      );

      // Process each position
      for (const position of xSTRKPositions) {
        if (!position.id) continue;
        try {
          const result: any = await positionContract.call(
            'get_token_info',
            [
              position.id,
              position.pool_key,
              {
                lower: {
                  mag: Math.abs(position.bounds.lower),
                  sign: position.bounds.lower < 0 ? 1 : 0,
                },
                upper: {
                  mag: Math.abs(position.bounds.upper),
                  sign: position.bounds.upper < 0 ? 1 : 0,
                },
              },
            ],
            {
              blockIdentifier: blockNumber ?? 'pending',
            }
          );

          if (this.config.xSTRKAddress === position.pool_key.token0) {
            xSTRKAmount += BigInt(result.amount0.toString());
            xSTRKAmount += BigInt(result.fees0.toString());
            STRKAmount += BigInt(result.amount1.toString());
            STRKAmount += BigInt(result.fees1.toString());
          } else {
            xSTRKAmount += BigInt(result.amount1.toString());
            xSTRKAmount += BigInt(result.fees1.toString());
            STRKAmount += BigInt(result.amount0.toString());
            STRKAmount += BigInt(result.fees0.toString());
          }
        } catch (error: any) {
          if (error.message.includes('NOT_INITIALIZED')) {
            // Skip uninitialized positions
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error('Error fetching Ekubo positions:', error);
      // Return zero holdings on error
    }

    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString(),
    };
  }

  async getPositionHistory(positionId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.config.apiUrl}/${positionId}/history`
      );
      return response.data?.events || [];
    } catch (error) {
      console.error('Error fetching position history:', error);
      return [];
    }
  }
} 
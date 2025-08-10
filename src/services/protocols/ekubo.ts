// Ekubo holdings service
import { BlockIdentifier, Contract } from 'starknet';
import { BaseHoldingsService } from '../holdings';
import type { HoldingsRequest, HoldingsResponse, ProtocolHoldings, SDKOptions } from '../../types';
import EkuboPositionAbi from '../../abis/ekubo.position.abi.json';
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import getApolloClient from '../../utils/apollo-client';
import { CONTRACTS } from '../../constants';

// Ekubo configuration
const EKUBO_CONFIG = {
  mainnet: {
    xSTRKAddress: '0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a',
    positionAddress: '0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067',
    deploymentBlock: 165388,
  },
  testnet: {
    xSTRKAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    positionAddress: '0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067',
    deploymentBlock: 165388,
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

const EKUBO_API_QUERY = gql`
  query GetEkuboPositionsByUser(
    $userAddress: String!
    $showClosed: Boolean!
    $toDateTime: DateTimeISO!
  ) {
    getEkuboPositionsByUser(
      userAddress: $userAddress
      showClosed: $showClosed
      toDateTime: $toDateTime
    ) {
      position_id
      timestamp
      lower_bound
      upper_bound
      pool_fee
      pool_tick_spacing
      extension
    }
  }
`;

export class EkuboHoldingsService extends BaseHoldingsService {
  private config: typeof EKUBO_CONFIG.mainnet;
  private apolloClient: ApolloClient<NormalizedCacheObject>;
  constructor(config: SDKOptions) {
    super(config);
    this.config = EKUBO_CONFIG[config.config.network as keyof typeof EKUBO_CONFIG] || EKUBO_CONFIG.mainnet;
    this.apolloClient = getApolloClient(config.config.network);
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
      const blockInfo = await this.sdkConfig.provider.getBlock(blockNumber ?? "latest");
      const resp = await this.apolloClient.query({
        query: EKUBO_API_QUERY,
        variables: {
          userAddress: address.toLowerCase(),
          showClosed: false, // Fetch both open and closed positions
          toDateTime: new Date(blockInfo.timestamp * 1000).toISOString(),
        },
      });
      const ekuboPositionsResp = resp;
      if (
        !ekuboPositionsResp ||
        !ekuboPositionsResp.data ||
        !ekuboPositionsResp.data.getEkuboPositionsByUser
      ) {
        throw new Error("Failed to fetch Ekubo positions data");
      }

      const ekuboPositions: {
        position_id: string;
        timestamp: string;
        lower_bound: number;
        upper_bound: number;
        pool_fee: string;
        pool_tick_spacing: string;
        extension: string;
      }[] = ekuboPositionsResp.data.getEkuboPositionsByUser;

      const positionContract = new Contract(
        EkuboPositionAbi,
        this.config.positionAddress,
        this.provider
      );

      // Process each position
      for (const position of ekuboPositions) {
        if (!position.position_id) continue;
        const poolKey = {
          token0: this.config.xSTRKAddress,
          token1: CONTRACTS.mainnet.strk,
          fee: position.pool_fee,
          tick_spacing: position.pool_tick_spacing,
          extension: position.extension,
        };
        try {
          const result: any = await positionContract.call(
            'get_token_info',
            [
              position.position_id,
              poolKey,
              {
                lower: {
                  mag: Math.abs(position.lower_bound),
                  sign: position.lower_bound < 0 ? 1 : 0,
                },
                upper: {
                  mag: Math.abs(position.upper_bound),
                  sign: position.upper_bound < 0 ? 1 : 0,
                },
              },
            ],
            {
              blockIdentifier: blockNumber ?? 'pending',
            }
          );

          if (this.config.xSTRKAddress === poolKey.token0) {
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
} 
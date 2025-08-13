// Opus holdings service
import { BlockIdentifier, Contract } from 'starknet';
import { BaseHoldingsService } from '../holdings';
import type { HoldingsRequest, HoldingsResponse, ProtocolHoldings, SDKOptions } from '../../types';
import OPUS_ABI from '../../abis/opus.abi.json';

// Opus configuration
const OPUS_CONFIG = {
  mainnet: {
    contract: {
      address: '0x04d0bb0a4c40012384e7c419e6eb3c637b28e8363fb66958b60d90505b9c072f',
      deploymentBlock: 973643,
    },
    xSTRKAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  },
  testnet: {
    contract: {
      address: '0x04d0bb0a4c40012384e7c419e6eb3c637b28e8363fb66958b60d90505b9c072f',
      deploymentBlock: 973643,
    },
    xSTRKAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  },
};

export class OpusHoldingsService extends BaseHoldingsService {
  private config: typeof OPUS_CONFIG.mainnet;

  constructor(config: SDKOptions) {
    super(config);
    this.config = OPUS_CONFIG[config.config.network as keyof typeof OPUS_CONFIG] || OPUS_CONFIG.mainnet;
  }

  async getHoldings(request: HoldingsRequest): Promise<HoldingsResponse> {
      this.validateProvider();
      this.validateAddress(request.address);

      const { address, blockNumber } = request;
      const holdings = await this.getOpusHoldings(address, blockNumber);

      return {
        success: true,
        data: holdings,
        protocol: 'opus',
        timestamp: Date.now(),
      };
  }

  private async getOpusHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    if (!this.isContractDeployed(blockNumber, this.config.contract.deploymentBlock)) {
      return this.createZeroHoldings();
    }

    const contract = new Contract(OPUS_ABI, this.config.contract.address, this.provider);
    
    // Get user trove IDs
    const userTroves = await contract.call('get_user_trove_ids', [address], {
      blockIdentifier: blockNumber ?? 'latest',
    });

    if (!userTroves || (userTroves as any).length === 0) {
      return this.createZeroHoldings();
    }

    // Get xSTRK balance for each trove
    const balancePromises = (userTroves as any).map((troveId: string) => {
      return contract.call('get_trove_asset_balance', [troveId, this.config.xSTRKAddress], {
        blockIdentifier: blockNumber ?? 'latest',
      });
    });

    const balances: bigint[] = await Promise.all(balancePromises);
    
    // Sum up all balances
    const xSTRKAmount = balances.reduce(
      (acc: bigint, balance: bigint) => acc + balance,
      BigInt(0)
    );

    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: '0',
    };
  }

  async getUserTroves(address: string, blockNumber?: BlockIdentifier): Promise<string[]> {
    if (!this.isContractDeployed(blockNumber, this.config.contract.deploymentBlock)) {
      return [];
    }

    const contract = new Contract(OPUS_ABI, this.config.contract.address, this.provider);
    
    const userTroves = await contract.call('get_user_trove_ids', [address], {
      blockIdentifier: blockNumber ?? 'latest',
    });

    return (userTroves as any) || [];
  }

  async getTroveAssetBalance(
    troveId: string,
    assetAddress: string,
    blockNumber?: BlockIdentifier
  ): Promise<string> {
    if (!this.isContractDeployed(blockNumber, this.config.contract.deploymentBlock)) {
      return '0';
    }

    const contract = new Contract(OPUS_ABI, this.config.contract.address, this.provider);
    
    const balance = await contract.call('get_trove_asset_balance', [troveId, assetAddress], {
      blockIdentifier: blockNumber ?? 'latest',
    });

    return balance.toString();
  }
} 
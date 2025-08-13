// LST holdings service
import { BlockIdentifier, Contract, RpcProvider } from 'starknet';
import { BaseHoldingsService } from '../holdings';
import type { HoldingsRequest, HoldingsResponse, ProtocolHoldings, SDKOptions } from '../../types';
import ERC4626_ABI from '../../abis/erc4626.abi.json';
import { CONTRACTS } from '../../constants';

// LST contract addresses and deployment blocks
const LST_CONFIG: Record<'mainnet' | 'testnet', {
  xSTRK: {
    address: string;
    deploymentBlock: number;
  }
}> = {
  mainnet: {
    xSTRK: {
      address: CONTRACTS.mainnet.lst,
      deploymentBlock: 929092,
    },
  },
  testnet: {
    xSTRK: {
      address: CONTRACTS.testnet.lst,
      deploymentBlock: 0,
    },
  },
};

export class LSTHoldingsService extends BaseHoldingsService {
  private config: typeof LST_CONFIG.mainnet;

  constructor(config: SDKOptions) {
    super(config);
    this.config = LST_CONFIG[config.config.network as keyof typeof LST_CONFIG] || LST_CONFIG.mainnet;
  }

  async getHoldings(request: HoldingsRequest): Promise<HoldingsResponse> {
    try {
      this.validateProvider();
      this.validateAddress(request.address);

      const { address, blockNumber } = request;
      const holdings = await this.getXSTRKHoldings(address, blockNumber);

      return {
        success: true,
        data: holdings,
        protocol: 'lst',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        protocol: 'lst',
        timestamp: Date.now(),
      };
    }
  }

  private async getXSTRKHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    // Check if contract is deployed
    if (!this.isContractDeployed(blockNumber, this.config.xSTRK.deploymentBlock)) {
      return this.createZeroHoldings();
    }

    const lstContract = new Contract(ERC4626_ABI, this.config.xSTRK.address, this.provider);
    
    const balance = await lstContract.call('balance_of', [address], {
      blockIdentifier: blockNumber ?? 'pending',
    });

    return {
      xSTRKAmount: balance.toString(),
      STRKAmount: '0',
    };
  }

  async getTotalAssets(blockNumber?: BlockIdentifier): Promise<string> {
    if (!this.isContractDeployed(blockNumber, this.config.xSTRK.deploymentBlock)) {
      return '0';
    }

    const lstContract = new Contract(ERC4626_ABI, this.config.xSTRK.address, this.provider);
    
    const totalAssets = await lstContract.call('total_assets', [], {
      blockIdentifier: blockNumber ?? 'pending',
    });

    return totalAssets.toString();
  }

  async getTotalSupply(blockNumber?: BlockIdentifier): Promise<string> {
    if (!this.isContractDeployed(blockNumber, this.config.xSTRK.deploymentBlock)) {
      return '0';
    }

    const lstContract = new Contract(ERC4626_ABI, this.config.xSTRK.address, this.provider);
    
    const totalSupply = await lstContract.call('total_supply', [], {
      blockIdentifier: blockNumber ?? 'pending',
    });

    return totalSupply.toString();
  }

  async getExchangeRate(blockNumber?: BlockIdentifier): Promise<string> {
    const totalAssets = await this.getTotalAssets(blockNumber);
    const totalSupply = await this.getTotalSupply(blockNumber);

    if (BigInt(totalSupply) === 0n) {
      return '0';
    }

    // Exchange rate = total assets / total supply
    return (BigInt(totalAssets) * BigInt(10 ** 18) / BigInt(totalSupply)).toString();
  }

  async convertXSTRKToSTRK(xSTRKAmount: string, blockNumber?: BlockIdentifier): Promise<string> {
    if (!this.isContractDeployed(blockNumber, this.config.xSTRK.deploymentBlock)) {
      return '0';
    }

    const lstContract = new Contract(ERC4626_ABI, this.config.xSTRK.address, this.provider);
    
    const strkAmount = await lstContract.call('convert_to_assets', [xSTRKAmount], {
      blockIdentifier: blockNumber ?? 'pending',
    });

    return strkAmount.toString();
  }
} 
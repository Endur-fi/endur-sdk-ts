// Nostra holdings service
import { BlockIdentifier, Contract } from 'starknet';
import { BaseHoldingsService } from '../holdings';
import type { HoldingsRequest, HoldingsResponse, ProtocolHoldings, SDKOptions } from '../../types';
import ERC4626_ABI from '../../abis/erc4626.abi.json';
import LP_TOKEN_ABI from '../../abis/nostra.lp.abi.json';

// Nostra configuration
const NOSTRA_CONFIG = {
  mainnet: {
    contracts: {
      nXSTRK: {
        address: '0x06878fd475d5cea090934d690ecbe4ad78503124e4f80380a2e45eb417aafb9c',
        deploymentBlock: 968482,
      },
      nXSTRKC: {
        address: '0x01b8d8e31f9dd1bde7dc878dd871225504837c78c40ff01cbf03a255e2154bf0',
        deploymentBlock: 968483,
      },
      iXSTRK: {
        address: '0x04d1125a716f547a0b69413c0098e811da3b799d173429c95da4290a00c139f7',
        deploymentBlock: 968483,
      },
      iXSTRKC: {
        address: '0x0257afe480da9255a026127cd3a295a580ef316b297a69be22b89729ae8c1d2a',
        deploymentBlock: 968484,
      },
      dXSTRK: {
        address: '0x0424638c9060d08b4820aabbb28347fc7234e2b7aadab58ad0f101e2412ea42d',
        deploymentBlock: 968481,
      },
    },
  },
  testnet: {
    contracts: {
      nXSTRK: {
        address: '0x06878fd475d5cea090934d690ecbe4ad78503124e4f80380a2e45eb417aafb9c',
        deploymentBlock: 968482,
      },
      nXSTRKC: {
        address: '0x01b8d8e31f9dd1bde7dc878dd871225504837c78c40ff01cbf03a255e2154bf0',
        deploymentBlock: 968483,
      },
      iXSTRK: {
        address: '0x04d1125a716f547a0b69413c0098e811da3b799d173429c95da4290a00c139f7',
        deploymentBlock: 968483,
      },
      iXSTRKC: {
        address: '0x0257afe480da9255a026127cd3a295a580ef316b297a69be22b89729ae8c1d2a',
        deploymentBlock: 968484,
      },
      dXSTRK: {
        address: '0x0424638c9060d08b4820aabbb28347fc7234e2b7aadab58ad0f101e2412ea42d',
        deploymentBlock: 968481,
      },
    },
  },
};

export class NostraLendingHoldingsService extends BaseHoldingsService {
  private config: typeof NOSTRA_CONFIG.mainnet;

  constructor(config: SDKOptions) {
    super(config);
    this.config = NOSTRA_CONFIG[config.config.network as keyof typeof NOSTRA_CONFIG] || NOSTRA_CONFIG.mainnet;
  }

  async getHoldings(request: HoldingsRequest): Promise<HoldingsResponse> {
    try {
      this.validateProvider();
      this.validateAddress(request.address);

      const { address, blockNumber } = request;
      const holdings = await this.getNostraHoldings(address, blockNumber);

      return {
        success: true,
        data: holdings,
        protocol: 'nostra',
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        protocol: 'nostra',
        timestamp: Date.now(),
      };
    }
  }

  private async getNostraHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);

    // Get holdings from all Nostra vaults
    const vaultHoldings = await Promise.all([
      this.getVaultHoldings(address, 'nXSTRK', blockNumber),
      this.getVaultHoldings(address, 'nXSTRKC', blockNumber),
      this.getVaultHoldings(address, 'iXSTRK', blockNumber),
      this.getVaultHoldings(address, 'iXSTRKC', blockNumber),
      this.getVaultHoldings(address, 'dXSTRK', blockNumber),
    ]);

    // Sum up vault holdings
    for (const holding of vaultHoldings) {
      xSTRKAmount += BigInt(holding.xSTRKAmount);
      STRKAmount += BigInt(holding.STRKAmount);
    }

    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString(),
    };
  }

  private async getVaultHoldings(
    address: string,
    vaultType: keyof typeof NOSTRA_CONFIG.mainnet.contracts,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    const contractConfig = this.config.contracts[vaultType];
    
    if (!this.isContractDeployed(blockNumber, contractConfig.deploymentBlock)) {
      return this.createZeroHoldings();
    }

    const contract = new Contract(ERC4626_ABI, contractConfig.address, this.provider);
    
    const balance = await contract.call('balance_of', [address], {
      blockIdentifier: blockNumber ?? 'latest',
    });

    return {
      xSTRKAmount: balance.toString(),
      STRKAmount: '0',
    };
  }

  async getVaultHoldingsByType(
    address: string,
    vaultType: keyof typeof NOSTRA_CONFIG.mainnet.contracts,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    return this.getVaultHoldings(address, vaultType, blockNumber);
  }
} 
// Vesu holdings service
import { BlockIdentifier, Contract } from 'starknet';
import { BaseHoldingsService } from '../holdings';
import type { HoldingsRequest, HoldingsResponse, ProtocolHoldings, SDKOptions } from '../../types';
import ERC4626_ABI from '../../abis/erc4626.abi.json';
import VESU_SINGLETON_ABI from '../../abis/vesu.singleton.abi.json';
import { CONTRACTS } from '../../constants';

// Vesu configuration
const VESU_CONFIG = {
  mainnet: {
    contracts: {
      vXSTRK: {
        address: '0x037ff012710c5175004687bc4d9e4c6e86d6ce5ca6fb6afee72ea02b1208fdb7',
        deploymentBlock: 954847,
        maxBlock: 1440400,
      },
      vXSTRKV2: {
        address: '0x040f67320745980459615f4f3e7dd71002dbe6c68c8249c847c82dbe327b23cb',
        deploymentBlock: 1440456,
      },
      vAlterscopeXSTRK: {
        address: '0x062b16a3c933bd60eddc9630c3d088f0a1e9dcd510fbbf4ff3fb3b6a3839fd8a',
        deploymentBlock: 1197971,
        maxBlock: 1440400,
      },
      vAlterscopeXSTRKV2: {
        address: '0x020478f0a1b1ef010aa24104ba0e91bf60efcabed02026b75e1d68690809e453',
        deploymentBlock: 1440471,
      },
      vRE7rUSDCXSTRK: {
        address: '0x069d2c197680bd60bafe1804239968275a1c85a1cad921809277306634b332b5',
        deploymentBlock: 1240391,
        maxBlock: 1440400,
      },
      vRE7rUSDCXSTRKV2: {
        address: '0x0318761ecb936a2905306c371c7935d2a6a0fa24493ac7c87be3859a36e2563a',
        deploymentBlock: 1440481,
      },
    },
    singleton: {
      address: '0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef',
      deploymentBlock: 954847,
      maxBlock: 1440400,
    },
    singletonV2: {
      address: '0x000d8d6dfec4d33bfb6895de9f3852143a17c6f92fd2a21da3d6924d34870160',
      deploymentBlock: 1440481,
    },
    pools: {
      RE7_XSTRK: {
        id: '0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161',
        deploymentBlock: 954847,
      },
      ALTERSCOPE_XSTRK: {
        id: '0x27f2bb7fb0e232befc5aa865ee27ef82839d5fad3e6ec1de598d0fab438cb56',
        deploymentBlock: 1197971,
      },
      RE7_rUSDC: {
        id: '0x3de03fafe6120a3d21dc77e101de62e165b2cdfe84d12540853bd962b970f99',
        deploymentBlock: 1240391,
      },
    },
    tokens: {
      xSTRK: CONTRACTS.mainnet.lst,
      STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
      USDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
      USDT: '0x068f5c6a617307684de5657061a5b3d3c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c',
      WBTC: '0x03fe2b97c1fd336e750087d68b641b00075fe5c8c8c8c8c8c8c8c8c8c8c8c8c',
      RUSDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    },
  },
  testnet: {
    contracts: {
      vXSTRK: {
        address: '0x037ff012710c5175004687bc4d9e4c6e86d6ce5ca6fb6afee72ea02b1208fdb7',
        deploymentBlock: 954847,
        maxBlock: 1440400,
      },
      vXSTRKV2: {
        address: '0x040f67320745980459615f4f3e7dd71002dbe6c68c8249c847c82dbe327b23cb',
        deploymentBlock: 1440456,
      },
      vAlterscopeXSTRK: {
        address: '0x062b16a3c933bd60eddc9630c3d088f0a1e9dcd510fbbf4ff3fb3b6a3839fd8a',
        deploymentBlock: 1197971,
        maxBlock: 1440400,
      },
      vAlterscopeXSTRKV2: {
        address: '0x020478f0a1b1ef010aa24104ba0e91bf60efcabed02026b75e1d68690809e453',
        deploymentBlock: 1440471,
      },
      vRE7rUSDCXSTRK: {
        address: '0x069d2c197680bd60bafe1804239968275a1c85a1cad921809277306634b332b5',
        deploymentBlock: 1240391,
        maxBlock: 1440400,
      },
      vRE7rUSDCXSTRKV2: {
        address: '0x0318761ecb936a2905306c371c7935d2a6a0fa24493ac7c87be3859a36e2563a',
        deploymentBlock: 1440481,
      },
    },
    singleton: {
      address: '0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef',
      deploymentBlock: 954847,
      maxBlock: 1440400,
    },
    singletonV2: {
      address: '0x000d8d6dfec4d33bfb6895de9f3852143a17c6f92fd2a21da3d6924d34870160',
      deploymentBlock: 1440481,
    },
    pools: {
      RE7_XSTRK: {
        id: '0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161',
        deploymentBlock: 954847,
      },
      ALTERSCOPE_XSTRK: {
        id: '0x27f2bb7fb0e232befc5aa865ee27ef82839d5fad3e6ec1de598d0fab438cb56',
        deploymentBlock: 1197971,
      },
      RE7_rUSDC: {
        id: '0x3de03fafe6120a3d21dc77e101de62e165b2cdfe84d12540853bd962b970f99',
        deploymentBlock: 1240391,
      },
    },
    tokens: {
      xSTRK: CONTRACTS.testnet.lst,
      STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
      USDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
      USDT: '0x068f5c6a617307684de5657061a5b3d3c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c',
      WBTC: '0x03fe2b97c1fd336e750087d68b641b00075fe5c8c8c8c8c8c8c8c8c8c8c8c8c',
      RUSDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    },
  },
};

export class VesuHoldingsService extends BaseHoldingsService {
  private config: typeof VESU_CONFIG.mainnet;

  constructor(config: SDKOptions) {
    super(config);
    this.config = VESU_CONFIG[config.config.network as keyof typeof VESU_CONFIG] || VESU_CONFIG.mainnet as any;
  }

  async getHoldings(request: HoldingsRequest): Promise<HoldingsResponse> {
    this.validateProvider();
    this.validateAddress(request.address);

    const { address, blockNumber } = request;
    const holdings = await this.getVesuHoldings(address, blockNumber);

    return {
      success: true,
      data: holdings,
      protocol: 'vesu',
      timestamp: Date.now(),
    };
  }

  private async getVesuHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);

    // Get vault holdings
    // Get vault and collateral holdings in parallel
    const [vaultHoldings, collateralHoldings] = await Promise.all([
      this.getVaultHoldings(address, blockNumber),
      this.getCollateralHoldings(address, blockNumber)
    ]);
    
    xSTRKAmount += BigInt(vaultHoldings.xSTRKAmount);
    STRKAmount += BigInt(vaultHoldings.STRKAmount);
    xSTRKAmount += BigInt(collateralHoldings.xSTRKAmount);
    STRKAmount += BigInt(collateralHoldings.STRKAmount);

    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString(),
    };
  }

  private async getVaultHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    const vaults = [
      { type: 'vXSTRK', config1: this.config.contracts.vXSTRK, config2: this.config.contracts.vXSTRKV2 },
      { type: 'vAlterscopeXSTRK', config1: this.config.contracts.vAlterscopeXSTRK, config2: this.config.contracts.vAlterscopeXSTRKV2 },
      { type: 'vRE7rUSDCXSTRK', config1: this.config.contracts.vRE7rUSDCXSTRK, config2: this.config.contracts.vRE7rUSDCXSTRKV2 },
    ];

    let totalXSTRK = BigInt(0);
    let totalSTRK = BigInt(0);

    const vaultHoldingsPromises = vaults.map(vault => 
      this.getVaultHoldingsByType(address, vault.type, vault.config1, vault.config2, blockNumber)
    );
    const vaultHoldingsResults = await Promise.all(vaultHoldingsPromises);

    for (const holdings of vaultHoldingsResults) {
      totalXSTRK += BigInt(holdings.xSTRKAmount);
      totalSTRK += BigInt(holdings.STRKAmount);
    }

    return {
      xSTRKAmount: totalXSTRK.toString(),
      STRKAmount: totalSTRK.toString(),
    };
  }

  private async getVaultHoldingsByType(
    address: string,
    vaultType: string,
    vaultConfig1: {address: string, deploymentBlock: number, maxBlock: number},
    vaultConfig2: {address: string, deploymentBlock: number},
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
      const isV1Deployed = this.isContractDeployed(blockNumber, vaultConfig1.deploymentBlock, vaultConfig1.maxBlock);
      const isV2Deployed = this.isContractDeployed(blockNumber, vaultConfig2.deploymentBlock);

      if (!isV1Deployed && !isV2Deployed) {
        return this.createZeroHoldings();
      }

      const vTokens = isV2Deployed ? [vaultConfig1.address, vaultConfig2.address] : [vaultConfig1.address];
      let totalBalance = BigInt(0);

      for (const token of vTokens) {
        const contract = new Contract(ERC4626_ABI, token, this.provider);
        
        const shares = await contract.call('balance_of', [address], {
          blockIdentifier: blockNumber ?? 'pending',
        });
        const assetsToken = isV2Deployed ? vaultConfig2.address : vaultConfig1.address;
        const contractV2 = new Contract(ERC4626_ABI, assetsToken, this.provider);
        
        const balance = await contractV2.call('convert_to_assets', [shares], {
          blockIdentifier: blockNumber ?? 'pending',
        });

        totalBalance += BigInt(balance.toString());
      }

      return {
        xSTRKAmount: totalBalance.toString(),
        STRKAmount: '0',
      };
  }

  private async getCollateralHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    const isSingletonDeployed = this.isContractDeployed(
      blockNumber, 
      this.config.singleton.deploymentBlock, 
      this.config.singleton.maxBlock
    );
    const isV2SingletonDeployed = this.isContractDeployed(
      blockNumber, 
      this.config.singletonV2.deploymentBlock
    );

    if (!isSingletonDeployed && !isV2SingletonDeployed) {
      return this.createZeroHoldings();
    }

    const singletonAddress = isV2SingletonDeployed 
      ? this.config.singletonV2.address 
      : this.config.singleton.address;

    let totalXSTRK = BigInt(0);

    // Check all pools for collateral
    const pools = [
      { id: this.config.pools.RE7_XSTRK.id, debtToken: this.config.tokens.STRK, deploymentBlock: this.config.pools.RE7_XSTRK.deploymentBlock },
      { id: this.config.pools.RE7_rUSDC.id, debtToken: this.config.tokens.RUSDC, deploymentBlock: this.config.pools.RE7_rUSDC.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.WBTC, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.ETH, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.USDC, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.USDT, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.STRK, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock },
    ];

    for (const pool of pools) {
      if (!this.isContractDeployed(blockNumber, pool.deploymentBlock)) {
        continue;
      }

      try {
        const contract = new Contract(VESU_SINGLETON_ABI, singletonAddress, this.provider);
        
        const position = await contract.call('position_unsafe', [
          pool.id,
          this.config.tokens.xSTRK,
          pool.debtToken,
          address,
        ], {
          blockIdentifier: blockNumber ?? 'pending',
        });

        totalXSTRK += BigInt((position as any)[1].toString());
      } catch (error: any) {
        if (error.message.includes('unknown-pool')) {
          // Skip unknown pools
          continue;
        }
        throw error;
      }
    }

    return {
      xSTRKAmount: totalXSTRK.toString(),
      STRKAmount: '0',
    };
  }
} 
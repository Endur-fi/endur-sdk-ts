// STRKFarm holdings service
import { BlockIdentifier, Contract } from 'starknet';
import { BaseHoldingsService } from '../holdings';
import type { HoldingsRequest, HoldingsResponse, ProtocolHoldings, SDKOptions } from '../../types';
import SENSEI_ABI from '../../abis/sensei.abi.json';
import EKUBO_STRKFARM_ABI from '../../abis/ekubo_strkfarm.abi.json';

// STRKFarm configuration
const STRKFARM_CONFIG = {
  mainnet: {
    contracts: {
      xSTRKSensei: {
        address: '0x07023a5cadc8a5db80e4f0fde6b330cbd3c17bbbf9cb145cbabd7bd5e6fb7b0b',
        deploymentBlock: 1053807,
      },
      ekuboXSTRKSTRK: {
        address: '0x01f083b98674bc21effee29ef443a00c7b9a500fd92cf30341a3da12c73f2324',
        deploymentBlock: 1209881,
      },
    },
  },
  testnet: {
    contracts: {
      xSTRKSensei: {
        address: '0x07023a5cadc8a5db80e4f0fde6b330cbd3c17bbbf9cb145cbabd7bd5e6fb7b0b',
        deploymentBlock: 1053807,
      },
      ekuboXSTRKSTRK: {
        address: '0x01f083b98674bc21effee29ef443a00c7b9a500fd92cf30341a3da12c73f2324',
        deploymentBlock: 1209881,
      },
    },
  },
};

export class STRKFarmSenseiHoldingsService extends BaseHoldingsService {
  private config: typeof STRKFARM_CONFIG.mainnet;

  constructor(config: SDKOptions) {
    super(config);
    this.config = STRKFARM_CONFIG[config.config.network as keyof typeof STRKFARM_CONFIG] || STRKFARM_CONFIG.mainnet;
  }

  async getHoldings(request: HoldingsRequest): Promise<HoldingsResponse> {
    try {
      this.validateProvider();
      this.validateAddress(request.address);

      const { address, blockNumber } = request;
      const holdings = await this.getSTRKFarmHoldings(address, blockNumber);

      return {
        success: true,
        data: holdings,
        protocol: 'strkfarm',
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        protocol: 'strkfarm',
        timestamp: Date.now(),
      };
    }
  }

  private async getSTRKFarmHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);

    // Get Sensei holdings
    const senseiHoldings = await this.getSenseiHoldings(address, blockNumber);
    xSTRKAmount += BigInt(senseiHoldings.xSTRKAmount);
    STRKAmount += BigInt(senseiHoldings.STRKAmount);

    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString(),
    };
  }

  private async getSenseiHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    if (!this.isContractDeployed(blockNumber, this.config.contracts.xSTRKSensei.deploymentBlock)) {
      return this.createZeroHoldings();
    }

    try {
      const contract = new Contract(SENSEI_ABI, this.config.contracts.xSTRKSensei.address, this.provider);
      
      const info = await contract.call('describe_position', [address], {
        blockIdentifier: blockNumber ?? 'pending',
      });

      const holdings = (info as any)[1];
      const xSTRKAmount = BigInt(holdings.deposit2.toString());

      return {
        xSTRKAmount: xSTRKAmount.toString(),
        STRKAmount: '0',
      };
    } catch (error) {
      return this.createZeroHoldings();
    }
  }
} 

export class STRKFarmEkuboHoldingsService extends BaseHoldingsService {
  private config: typeof STRKFARM_CONFIG.mainnet;

  constructor(config: SDKOptions) {
    super(config);
    this.config = STRKFARM_CONFIG[config.config.network as keyof typeof STRKFARM_CONFIG] || STRKFARM_CONFIG.mainnet;
  }

  async getHoldings(request: HoldingsRequest): Promise<HoldingsResponse> {
    try {
      this.validateProvider();
      this.validateAddress(request.address);

      const { address, blockNumber } = request;
      const holdings = await this.getSTRKFarmHoldings(address, blockNumber);

      return {
        success: true,
        data: holdings,
        protocol: 'strkfarm',
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        protocol: 'strkfarm',
        timestamp: Date.now(),
      };
    }
  }

  private async getSTRKFarmHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);

    // Get Ekubo STRKFarm holdings
    const ekuboHoldings = await this.getEkuboSTRKFarmHoldings(address, blockNumber);
    xSTRKAmount += BigInt(ekuboHoldings.xSTRKAmount);
    STRKAmount += BigInt(ekuboHoldings.STRKAmount);

    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString(),
    };
  }

  private async getEkuboSTRKFarmHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    if (!this.isContractDeployed(blockNumber, this.config.contracts.ekuboXSTRKSTRK.deploymentBlock)) {
      return this.createZeroHoldings();
    }

    const contract = new Contract(EKUBO_STRKFARM_ABI, this.config.contracts.ekuboXSTRKSTRK.address, this.provider);
    
    const balance = await contract.call('balanceOf', [address], {
      blockIdentifier: blockNumber ?? 'pending',
    });

    const assets = await contract.call('convert_to_assets', [balance.toString()], {
      blockIdentifier: blockNumber ?? 'pending',
    });

    const xSTRKAmount = BigInt((assets as any).amount0.toString());
    const STRKAmount = BigInt((assets as any).amount1.toString());

    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString(),
    };
  }
} 
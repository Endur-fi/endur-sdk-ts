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
      lpToken: {
        address: '0x00205fd8586f6be6c16f4aa65cc1034ecff96d96481878e55f629cd0cb83e05f',
        deploymentBlock: 940755,
      },
    },
  },
  testnet: {
    contracts: {
      lpToken: {
        address: '0x00205fd8586f6be6c16f4aa65cc1034ecff96d96481878e55f629cd0cb83e05f',
        deploymentBlock: 940755,
      },
    },
  },
};

export class NostraDexHoldingsService extends BaseHoldingsService {
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

    // Get LP token holdings
    const lpHoldings = await this.getLPHoldings(address, blockNumber);
    xSTRKAmount += BigInt(lpHoldings.xSTRKAmount);
    STRKAmount += BigInt(lpHoldings.STRKAmount);

    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString(),
    };
  }

  private async getLPHoldings(
    address: string,
    blockNumber?: BlockIdentifier
  ): Promise<ProtocolHoldings> {
    const lpConfig = this.config.contracts.lpToken;
    
    if (!this.isContractDeployed(blockNumber, lpConfig.deploymentBlock)) {
      return this.createZeroHoldings();
    }

    const contract = new Contract(LP_TOKEN_ABI, lpConfig.address, this.provider);
    
    const balance = await contract.call('balance_of', [address], {
      blockIdentifier: blockNumber ?? 'latest',
    });

    const totalSupply = await contract.call('total_supply', [], {
      blockIdentifier: blockNumber ?? 'latest',
    });

    const reserves = await contract.call('get_reserves', [], {
      blockIdentifier: blockNumber ?? 'latest',
    });

    const balanceStr = balance.toString();
    const totalSupplyStr = totalSupply.toString();
    const reserve0Str = (reserves as any)[0].toString();
    const reserve1Str = (reserves as any)[1].toString();

    // Calculate proportional amounts
    const balanceNum = Number(balanceStr);
    const totalSupplyNum = Number(totalSupplyStr);
    const reserve0Num = Number(reserve0Str);
    const reserve1Num = Number(reserve1Str);

    const xSTRKTokenBal = totalSupplyNum === 0 
      ? 0 
      : (balanceNum / totalSupplyNum) * reserve0Num;

    const STRKTokenBal = totalSupplyNum === 0 
      ? 0 
      : (balanceNum / totalSupplyNum) * reserve1Num;

    return {
      xSTRKAmount: BigInt(Math.floor(xSTRKTokenBal)).toString(),
      STRKAmount: BigInt(Math.floor(STRKTokenBal)).toString(),
    };
  }
} 
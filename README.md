# Endur TypeScript SDK

A comprehensive TypeScript SDK for interacting with the Endur ecosystem, supporting multiple DeFi protocols and providing unified holdings computation.

## Features

- **Multi-Protocol Support**: LST, Ekubo, Nostra, Opus, STRKFarm, and Vesu
- **Unified Holdings API**: Get xSTRK and STRK holdings across all protocols
- **Browser & Node.js Compatible**: Built with tsup for universal compatibility
- **TypeScript First**: Full TypeScript support with comprehensive type definitions
- **Starknet Integration**: Native Starknet provider and account support

## Installation

```bash
npm install @endur/sdk
# or
yarn add @endur/sdk
# or
pnpm add @endur/sdk
```

## Quick Start

### Basic Usage

```typescript
import { EndurSDK } from '@endur/sdk';
import { RpcProvider } from 'starknet';

// Initialize SDK
const sdk = new EndurSDK({
  config: {
    network: 'mainnet',
    timeout: 30000,
  },
});

// Set up Starknet provider
const provider = new RpcProvider({ nodeUrl: 'https://alpha-mainnet.starknet.io' });
sdk.setProvider(provider);

// Get holdings for a specific address
const holdings = await sdk.holdings.getMultiProtocolHoldings({
  address: '0x1234...',
  provider,
  blockNumber: 'latest',
});

console.log('Total xSTRK:', holdings.total.xSTRKAmount);
console.log('Total STRK:', holdings.total.STRKAmount);
```

### Protocol-Specific Holdings

```typescript
// Get holdings for a specific protocol
const lstHoldings = await sdk.holdings.getProtocolHoldings('lst', {
  address: '0x1234...',
  provider,
});

const ekuboHoldings = await sdk.holdings.getProtocolHoldings('ekubo', {
  address: '0x1234...',
  provider,
});
```

### LST Operations

```typescript
// Get exchange rate
const exchangeRate = await sdk.lst.getExchangeRate();

// Convert xSTRK to STRK
const strkAmount = await sdk.lst.convertXSTRKToSTRK('1000000000000000000');

// Get total supply
const totalSupply = await sdk.lst.getTotalSupply();
```

## API Reference

### Core SDK

#### `EndurSDK`

Main SDK class that provides access to all services.

```typescript
const sdk = new EndurSDK(options?: SDKOptions);
```

**Options:**
- `config`: SDK configuration
- `provider`: Starknet provider instance
- `account`: Starknet account instance

#### Methods

- `setProvider(provider)`: Set Starknet provider
- `setAccount(account)`: Set Starknet account
- `getNetwork()`: Get current network
- `updateConfig(config)`: Update SDK configuration

### Holdings Manager

#### `HoldingsManager`

Manages holdings computation across all supported protocols.

```typescript
const holdings = sdk.holdings;
```

#### Methods

- `getProtocolHoldings(protocol, request)`: Get holdings for specific protocol
- `getMultiProtocolHoldings(request, protocols?)`: Get holdings across multiple protocols
- `getAvailableProtocols()`: Get list of available protocols
- `setProvider(provider)`: Set provider for all protocol services

### Supported Protocols

#### LST (Liquid Staking Token)
- **Type**: `'lst'`
- **Description**: Liquid staking token protocol
- **Features**: Exchange rate calculation, total supply, balance conversion

#### Ekubo
- **Type**: `'ekubo'`
- **Description**: Concentrated liquidity AMM
- **Features**: Position tracking, fee calculation

#### Nostra
- **Type**: `'nostra'`
- **Description**: Lending and borrowing protocol
- **Features**: Vault balances, LP token calculations

#### Opus
- **Type**: `'opus'`
- **Description**: CDP and lending protocol
- **Features**: Trove management, asset balance tracking

#### STRKFarm
- **Type**: `'strkfarm'`
- **Description**: Yield farming protocol
- **Features**: Farm positions, reward calculations

#### Vesu
- **Type**: `'vesu'`
- **Description**: DeFi protocol with vaults and collateral
- **Features**: Vault balances, collateral positions

## Types

### Core Types

```typescript
interface ProtocolHoldings {
  xSTRKAmount: string;
  STRKAmount: string;
}

interface HoldingsRequest {
  address: string;
  provider: any;
  blockNumber?: BlockIdentifier;
  protocol?: string;
}

interface HoldingsResponse {
  success: boolean;
  data?: ProtocolHoldings;
  error?: string;
  protocol: string;
  timestamp: number;
}

interface MultiProtocolHoldings {
  total: ProtocolHoldings;
  byProtocol: Record<string, ProtocolHoldings>;
  protocols: string[];
}
```

## Development

### Building

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Development mode with watch
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team. 
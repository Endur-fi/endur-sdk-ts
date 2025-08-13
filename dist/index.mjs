import axios from 'axios';
import { Contract } from 'starknet';
import { gql, ApolloClient, InMemoryCache } from '@apollo/client';

// src/utils/validation.ts
function isValidStarknetAddress(address) {
  if (!address || typeof address !== "string") {
    return false;
  }
  return address.startsWith("0x");
}
function isValidHexString(hex) {
  if (!hex || typeof hex !== "string") {
    return false;
  }
  const hexRegex = /^0x[a-fA-F0-9]+$/;
  return hexRegex.test(hex);
}
function isValidNumber(value) {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}
function isValidString(value) {
  return typeof value === "string" && value.length > 0;
}
function isValidBoolean(value) {
  return typeof value === "boolean";
}
function isValidObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isValidArray(value) {
  return Array.isArray(value);
}

// src/utils/formatting.ts
function formatNumber(value, decimals = 2) {
  return value.toFixed(decimals);
}
function formatPercentage(value, decimals = 2) {
  return `${(value * 100).toFixed(decimals)}%`;
}
function formatLargeNumber(value) {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
}
function formatAddress(address) {
  if (!address || address.length < 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
function formatTransactionHash(hash) {
  if (!hash || hash.length < 10) {
    return hash;
  }
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}
function formatTimestamp(timestamp) {
  return new Date(timestamp * 1e3).toLocaleString();
}
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  }
  if (seconds < 86400) {
    const hours2 = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    return `${hours2}h ${minutes}m`;
  }
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  return `${days}d ${hours}h`;
}

// src/utils/math.ts
function toWei(amount, decimals = 18) {
  return (amount * Math.pow(10, decimals)).toString();
}
function fromWei(amount, decimals = 18) {
  return parseInt(amount) / Math.pow(10, decimals);
}
function safeAdd(a, b) {
  return a + b;
}
function safeSubtract(a, b) {
  return a - b;
}
function safeMultiply(a, b) {
  return a * b;
}
function safeDivide(a, b) {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}
function calculatePercentage(part, total) {
  if (total === 0) {
    return 0;
  }
  return part / total * 100;
}
function roundToDecimals(value, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function isInRange(value, min, max) {
  return value >= min && value <= max;
}

// src/utils/crypto.ts
function generateRandomHex(length = 32) {
  const bytes = new Uint8Array(length / 2);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function stringToHex(str) {
  return "0x" + Array.from(str, (char) => char.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}
function hexToString(hex) {
  if (hex.startsWith("0x")) {
    hex = hex.slice(2);
  }
  return String.fromCharCode(...hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}
function numberToHex(num) {
  return "0x" + num.toString(16);
}
function hexToNumber(hex) {
  if (hex.startsWith("0x")) {
    hex = hex.slice(2);
  }
  return parseInt(hex, 16);
}
function padHex(hex, length) {
  if (hex.startsWith("0x")) {
    hex = hex.slice(2);
  }
  return "0x" + hex.padStart(length, "0");
}
function isHexString(str) {
  if (!str.startsWith("0x")) {
    return false;
  }
  return /^0x[a-fA-F0-9]+$/.test(str);
}

// src/constants/networks.ts
var NETWORKS = {
  mainnet: {
    name: "Starknet Mainnet",
    chainId: "0x534e5f4d41494e",
    rpcUrl: "https://alpha-mainnet.starknet.io",
    explorerUrl: "https://starkscan.co"
  },
  testnet: {
    name: "Starknet Testnet",
    chainId: "0x534e5f474f45524c49",
    rpcUrl: "https://alpha4.starknet.io",
    explorerUrl: "https://testnet.starkscan.co"
  },
  devnet: {
    name: "Starknet Devnet",
    chainId: "0x534e5f474f45524c49",
    rpcUrl: "http://127.0.0.1:5050",
    explorerUrl: "http://127.0.0.1:5050"
  }
};
var DEFAULT_NETWORK = "mainnet";
var DEFAULT_TIMEOUT = 3e4;

// src/constants/contracts.ts
var CONTRACTS = {
  mainnet: {
    lst: "0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a",
    withdrawalQueue: "0x518a66e579f9eb1603f5ffaeff95d3f013788e9c37ee94995555026b9648b6",
    strk: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
  },
  testnet: {
    lst: "0x0",
    withdrawalQueue: "0x0",
    strk: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
  }
};
var CONTRACT_NAMES = {
  LST: "lst",
  DELEGATOR: "delegator",
  WITHDRAWAL_QUEUE: "withdrawalQueue",
  STRK: "strk"
};

// src/constants/api.ts
var API_ENDPOINTS = {
  mainnet: {
    base: "https://api.endur.fi",
    graphql: "https://api.endur.fi/graphql"
  },
  testnet: {
    base: "https://api-testnet.endur.fi",
    graphql: "https://api-testnet.endur.fi/graphql"
  },
  devnet: {
    base: "http://localhost:3000",
    graphql: "http://localhost:3000/graphql"
  }
};
var API_ROUTES = {
  USER_INFO: "/user",
  LEADERBOARD: "/leaderboard",
  PORTFOLIO: "/portfolio",
  POINTS: "/points",
  ALLOCATION: "/allocation",
  STATUS: "/status"
};
var DEFAULT_API_TIMEOUT = 1e4;
var MAX_RETRIES = 3;
var RETRY_DELAY = 1e3;

// src/services/api.ts
var ApiService = class {
  constructor(network = "mainnet", timeout = DEFAULT_API_TIMEOUT) {
    this.network = network;
    this.client = axios.create({
      baseURL: API_ENDPOINTS[network]?.base,
      timeout,
      headers: {
        "Content-Type": "application/json"
      }
    });
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        return Promise.reject(this.handleApiError(error));
      }
    );
  }
  /**
   * Makes a GET request to the API
   */
  async get(url, config) {
    try {
      const response = await this.client.get(url, config);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error };
    }
  }
  /**
   * Makes a POST request to the API
   */
  async post(url, data, config) {
    try {
      const response = await this.client.post(url, data, config);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error };
    }
  }
  /**
   * Handles API errors
   */
  handleApiError(error) {
    if (error.response) {
      return {
        code: error.response.status.toString(),
        message: error.response.data?.message || "API request failed",
        details: error.response.data
      };
    }
    if (error.request) {
      return {
        code: "NETWORK_ERROR",
        message: "Network error - no response received",
        details: error.request
      };
    }
    return {
      code: "UNKNOWN_ERROR",
      message: error.message || "Unknown error occurred",
      details: error
    };
  }
  /**
   * Gets user information
   */
  async getUserInfo(address) {
    return this.get(`${API_ROUTES.USER_INFO}/${address}`);
  }
  /**
   * Gets leaderboard data
   */
  async getLeaderboard(limit = 100) {
    return this.get(`${API_ROUTES.LEADERBOARD}?limit=${limit}`);
  }
  /**
   * Gets portfolio data for a user
   */
  async getPortfolio(address) {
    return this.get(`${API_ROUTES.PORTFOLIO}/${address}`);
  }
  /**
   * Gets points data for a user
   */
  async getPoints(address) {
    return this.get(`${API_ROUTES.POINTS}/${address}`);
  }
  /**
   * Gets allocation data for a user
   */
  async getAllocation(address) {
    return this.get(`${API_ROUTES.ALLOCATION}/${address}`);
  }
  /**
   * Gets API status
   */
  async getStatus() {
    return this.get(API_ROUTES.STATUS);
  }
};

// src/services/starknet.ts
var StarknetService = class {
  constructor(provider, account, network = "mainnet") {
    this.provider = provider;
    this.account = account;
    this.network = network;
  }
  /**
   * Sets the provider
   */
  setProvider(provider) {
    this.provider = provider;
  }
  /**
   * Sets the account
   */
  setAccount(account) {
    this.account = account;
  }
  /**
   * Gets the current network
   */
  getNetwork() {
    return this.network;
  }
  /**
   * Calls a contract function
   */
  async callContract(callData) {
    if (!this.provider) {
      throw new Error("Provider not set");
    }
    if (!isValidStarknetAddress(callData.contractAddress)) {
      throw new Error("Invalid contract address");
    }
    try {
      const result = await this.provider.callContract({
        contractAddress: callData.contractAddress,
        entrypoint: callData.entrypoint,
        calldata: callData.calldata
      });
      return result;
    } catch (error) {
      throw new Error(`Contract call failed: ${error}`);
    }
  }
  /**
   * Executes a transaction
   */
  async executeTransaction(calls, options) {
    if (!this.account) {
      throw new Error("Account not set");
    }
    try {
      const result = await this.account.execute(calls, void 0, options);
      return {
        transactionHash: result.transaction_hash,
        status: "PENDING"
      };
    } catch (error) {
      throw new Error(`Transaction execution failed: ${error}`);
    }
  }
  /**
   * Gets transaction status
   */
  async getTransactionStatus(transactionHash) {
    if (!this.provider) {
      throw new Error("Provider not set");
    }
    if (!isValidHexString(transactionHash)) {
      throw new Error("Invalid transaction hash");
    }
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      return {
        transactionHash,
        status: receipt.status,
        blockNumber: receipt.block_number,
        blockHash: receipt.block_hash
      };
    } catch (error) {
      throw new Error(`Failed to get transaction status: ${error}`);
    }
  }
  /**
   * Gets events
   */
  async getEvents(filter) {
    if (!this.provider) {
      throw new Error("Provider not set");
    }
    try {
      const events = await this.provider.getEvents(filter);
      return events.map((event) => ({
        transactionHash: event.transaction_hash,
        blockNumber: event.block_number,
        blockHash: event.block_hash,
        address: event.from_address,
        keys: event.keys,
        data: event.data
      }));
    } catch (error) {
      throw new Error(`Failed to get events: ${error}`);
    }
  }
  /**
   * Gets block information
   */
  async getBlockInfo(blockNumber) {
    if (!this.provider) {
      throw new Error("Provider not set");
    }
    try {
      const block = await this.provider.getBlock(blockNumber || "latest");
      return {
        blockNumber: block.block_number,
        blockHash: block.block_hash,
        timestamp: block.timestamp,
        parentHash: block.parent_block_hash,
        sequencerAddress: block.sequencer_address
      };
    } catch (error) {
      throw new Error(`Failed to get block info: ${error}`);
    }
  }
  /**
   * Gets the current block number
   */
  async getBlockNumber() {
    if (!this.provider) {
      throw new Error("Provider not set");
    }
    try {
      const block = await this.provider.getBlock("latest");
      return block.block_number;
    } catch (error) {
      throw new Error(`Failed to get block number: ${error}`);
    }
  }
  /**
   * Gets account balance
   */
  async getBalance(address, tokenAddress) {
    if (!this.provider) {
      throw new Error("Provider not set");
    }
    if (!isValidStarknetAddress(address)) {
      throw new Error("Invalid address");
    }
    try {
      const balance = await this.provider.getBalance(address, tokenAddress);
      return balance.balance;
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }
};

// src/services/lst.ts
var LSTService = class {
  constructor(starknetService, network = "mainnet") {
    this.starknetService = starknetService;
    this.network = network;
  }
  /**
   * Gets the LST contract address for the current network
   */
  getLSTAddress() {
    return CONTRACTS[this.network]?.lst || "";
  }
  /**
   * Gets the withdrawal queue contract address for the current network
   */
  getWithdrawalQueueAddress() {
    return CONTRACTS[this.network]?.withdrawalQueue || "";
  }
  /**
   * Deposits ETH to get LST tokens
   */
  async deposit(amount, options) {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error("Invalid LST contract address");
    }
    const callData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: "deposit",
      calldata: [amount]
    };
    return this.starknetService.executeTransaction([callData], options);
  }
  /**
   * Deposits ETH with a referral code
   */
  async depositWithReferral(amount, referralCode, options) {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error("Invalid LST contract address");
    }
    const callData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: "deposit_with_referral",
      calldata: [amount, referralCode]
    };
    return this.starknetService.executeTransaction([callData], options);
  }
  /**
   * Mints LST tokens
   */
  async mint(amount, options) {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error("Invalid LST contract address");
    }
    const callData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: "mint",
      calldata: [amount]
    };
    return this.starknetService.executeTransaction([callData], options);
  }
  /**
   * Redeems LST tokens for ETH
   */
  async redeem(amount, options) {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error("Invalid LST contract address");
    }
    const callData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: "redeem",
      calldata: [amount]
    };
    return this.starknetService.executeTransaction([callData], options);
  }
  /**
   * Gets the exchange rate between ETH and LST
   */
  async getExchangeRate() {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error("Invalid LST contract address");
    }
    const callData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: "get_exchange_rate",
      calldata: []
    };
    const result = await this.starknetService.callContract(callData);
    return result.result[0];
  }
  /**
   * Gets the total supply of LST tokens
   */
  async getTotalSupply() {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error("Invalid LST contract address");
    }
    const callData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: "total_supply",
      calldata: []
    };
    const result = await this.starknetService.callContract(callData);
    return result.result[0];
  }
  /**
   * Gets the balance of LST tokens for an address
   */
  async getBalance(address) {
    if (!isValidStarknetAddress(this.getLSTAddress())) {
      throw new Error("Invalid LST contract address");
    }
    if (!isValidStarknetAddress(address)) {
      throw new Error("Invalid address");
    }
    const callData = {
      contractAddress: this.getLSTAddress(),
      entrypoint: "balance_of",
      calldata: [address]
    };
    const result = await this.starknetService.callContract(callData);
    return result.result[0];
  }
  /**
   * Stakes LST tokens through the delegator
   */
  async stake(amount, delegatorAddress, options) {
    const callData = {
      contractAddress: delegatorAddress,
      entrypoint: "stake",
      calldata: [amount]
    };
    return this.starknetService.executeTransaction([callData], options);
  }
  /**
   * Unstakes LST tokens through the delegator
   */
  async unstake(amount, delegatorAddress, options) {
    const callData = {
      contractAddress: delegatorAddress,
      entrypoint: "unstake",
      calldata: [amount]
    };
    return this.starknetService.executeTransaction([callData], options);
  }
  /**
   * Requests withdrawal from the withdrawal queue
   */
  async requestWithdrawal(amount, options) {
    if (!isValidStarknetAddress(this.getWithdrawalQueueAddress())) {
      throw new Error("Invalid withdrawal queue contract address");
    }
    const callData = {
      contractAddress: this.getWithdrawalQueueAddress(),
      entrypoint: "request_withdrawal",
      calldata: [amount]
    };
    return this.starknetService.executeTransaction([callData], options);
  }
  /**
   * Claims withdrawal from the withdrawal queue
   */
  async claimWithdrawal(requestId, options) {
    if (!isValidStarknetAddress(this.getWithdrawalQueueAddress())) {
      throw new Error("Invalid withdrawal queue contract address");
    }
    const callData = {
      contractAddress: this.getWithdrawalQueueAddress(),
      entrypoint: "claim_withdrawal",
      calldata: [requestId]
    };
    return this.starknetService.executeTransaction([callData], options);
  }
};

// src/services/holdings.ts
var BaseHoldingsService = class {
  constructor(config) {
    this.sdkConfig = config;
    this.provider = config.provider;
  }
  /**
   * Sets the provider
   */
  setProvider(provider) {
    this.provider = provider;
  }
  /**
   * Checks if a contract is deployed at a given block
   */
  isContractDeployed(blockNumber = "pending", deploymentBlock, maxBlock) {
    const lowerCondition = Number.isInteger(blockNumber) && blockNumber < deploymentBlock;
    const upperCondition = maxBlock && (blockNumber > maxBlock || blockNumber === "latest" || blockNumber === "pending" || !blockNumber);
    return !(lowerCondition || upperCondition);
  }
  /**
   * Creates zero holdings
   */
  createZeroHoldings() {
    return {
      xSTRKAmount: "0",
      STRKAmount: "0"
    };
  }
  /**
   * Validates address
   */
  validateAddress(address) {
    if (!isValidStarknetAddress(address)) {
      throw new Error("Invalid address provided");
    }
  }
  /**
   * Validates provider
   */
  validateProvider() {
    if (!this.provider) {
      throw new Error("Provider not set");
    }
  }
  /**
   * Adds two holdings together
   */
  addHoldings(a, b) {
    return {
      xSTRKAmount: (BigInt(a.xSTRKAmount) + BigInt(b.xSTRKAmount)).toString(),
      STRKAmount: (BigInt(a.STRKAmount) + BigInt(b.STRKAmount)).toString()
    };
  }
  /**
   * Multiplies holdings by a factor
   */
  multiplyHoldings(holdings, factor) {
    return {
      xSTRKAmount: (BigInt(holdings.xSTRKAmount) * BigInt(factor)).toString(),
      STRKAmount: (BigInt(holdings.STRKAmount) * BigInt(factor)).toString()
    };
  }
  /**
   * Gets holdings for multiple protocols
   */
  async getMultiProtocolHoldings(request, protocols) {
    const byProtocol = {};
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
      protocols
    };
  }
};

// src/abis/erc4626.abi.json
var erc4626_abi_default = [
  {
    name: "MyERC4626Impl",
    type: "impl",
    interface_name: "lst::lst::interface::IERC4626"
  },
  {
    name: "core::integer::u256",
    type: "struct",
    members: [
      {
        name: "low",
        type: "core::integer::u128"
      },
      {
        name: "high",
        type: "core::integer::u128"
      }
    ]
  },
  {
    name: "lst::lst::interface::IERC4626",
    type: "interface",
    items: [
      {
        name: "asset",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "total_assets",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "convert_to_shares",
        type: "function",
        inputs: [
          {
            name: "assets",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "convert_to_assets",
        type: "function",
        inputs: [
          {
            name: "shares",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "max_deposit",
        type: "function",
        inputs: [
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "preview_deposit",
        type: "function",
        inputs: [
          {
            name: "assets",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "deposit",
        type: "function",
        inputs: [
          {
            name: "assets",
            type: "core::integer::u256"
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "max_mint",
        type: "function",
        inputs: [
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "preview_mint",
        type: "function",
        inputs: [
          {
            name: "shares",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "mint",
        type: "function",
        inputs: [
          {
            name: "shares",
            type: "core::integer::u256"
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "max_withdraw",
        type: "function",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "preview_withdraw",
        type: "function",
        inputs: [
          {
            name: "assets",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "withdraw",
        type: "function",
        inputs: [
          {
            name: "assets",
            type: "core::integer::u256"
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "max_redeem",
        type: "function",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "preview_redeem",
        type: "function",
        inputs: [
          {
            name: "shares",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "redeem",
        type: "function",
        inputs: [
          {
            name: "shares",
            type: "core::integer::u256"
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "LSTAdditionalImpl",
    type: "impl",
    interface_name: "lst::lst::interface::ILSTAdditional"
  },
  {
    name: "core::byte_array::ByteArray",
    type: "struct",
    members: [
      {
        name: "data",
        type: "core::array::Array::<core::bytes_31::bytes31>"
      },
      {
        name: "pending_word",
        type: "core::felt252"
      },
      {
        name: "pending_word_len",
        type: "core::integer::u32"
      }
    ]
  },
  {
    name: "lst::withdrawal_queue::interface::IWithdrawalQueueDispatcher",
    type: "struct",
    members: [
      {
        name: "contract_address",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    name: "contracts::staking::interface::IStakingDispatcher",
    type: "struct",
    members: [
      {
        name: "contract_address",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    name: "lst::lst::interface::Config",
    type: "struct",
    members: [
      {
        name: "deposit_fee_bps",
        type: "core::integer::u256"
      },
      {
        name: "withdraw_fee_bps",
        type: "core::integer::u256"
      },
      {
        name: "rewards_fee_bps",
        type: "core::integer::u256"
      },
      {
        name: "treasury",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "withdraw_queue",
        type: "lst::withdrawal_queue::interface::IWithdrawalQueueDispatcher"
      },
      {
        name: "staker",
        type: "contracts::staking::interface::IStakingDispatcher"
      }
    ]
  },
  {
    name: "core::bool",
    type: "enum",
    variants: [
      {
        name: "False",
        type: "()"
      },
      {
        name: "True",
        type: "()"
      }
    ]
  },
  {
    name: "lst::lst::interface::DelegatorInfo",
    type: "struct",
    members: [
      {
        name: "is_active",
        type: "core::bool"
      },
      {
        name: "delegator_index",
        type: "core::integer::u32"
      }
    ]
  },
  {
    name: "lst::lst::interface::ILSTAdditional",
    type: "interface",
    items: [
      {
        name: "deposit_with_referral",
        type: "function",
        inputs: [
          {
            name: "assets",
            type: "core::integer::u256"
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "referral",
            type: "core::byte_array::ByteArray"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "set_config",
        type: "function",
        inputs: [
          {
            name: "config",
            type: "lst::lst::interface::Config"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "get_config",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "lst::lst::interface::Config"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "stake",
        type: "function",
        inputs: [
          {
            name: "delegator",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "send_to_withdraw_queue",
        type: "function",
        inputs: [
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "before_unstake",
        type: "function",
        inputs: [
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "add_delegator",
        type: "function",
        inputs: [
          {
            name: "delegator",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "update_delegator_info",
        type: "function",
        inputs: [
          {
            name: "delegator",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "info",
            type: "lst::lst::interface::DelegatorInfo"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "is_delegator",
        type: "function",
        inputs: [
          {
            name: "delegator",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "claim_rewards",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "CommonCompImpl",
    type: "impl",
    interface_name: "lst::utils::common::ICommon"
  },
  {
    name: "lst::utils::common::ICommon",
    type: "interface",
    items: [
      {
        name: "upgrade",
        type: "function",
        inputs: [
          {
            name: "new_class",
            type: "core::starknet::class_hash::ClassHash"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "pause",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "unpause",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "is_paused",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "owner",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "transfer_ownership",
        type: "function",
        inputs: [
          {
            name: "new_owner",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "renounce_ownership",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "ERC4626MetadataImpl",
    type: "impl",
    interface_name: "openzeppelin_token::erc20::interface::IERC20Metadata"
  },
  {
    name: "openzeppelin_token::erc20::interface::IERC20Metadata",
    type: "interface",
    items: [
      {
        name: "name",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::byte_array::ByteArray"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "symbol",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::byte_array::ByteArray"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "decimals",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u8"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    name: "ERC20Impl",
    type: "impl",
    interface_name: "openzeppelin_token::erc20::interface::IERC20"
  },
  {
    name: "openzeppelin_token::erc20::interface::IERC20",
    type: "interface",
    items: [
      {
        name: "total_supply",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "balance_of",
        type: "function",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "allowance",
        type: "function",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "transfer",
        type: "function",
        inputs: [
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "transfer_from",
        type: "function",
        inputs: [
          {
            name: "sender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "approve",
        type: "function",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "ERC20CamelOnlyImpl",
    type: "impl",
    interface_name: "openzeppelin_token::erc20::interface::IERC20CamelOnly"
  },
  {
    name: "openzeppelin_token::erc20::interface::IERC20CamelOnly",
    type: "interface",
    items: [
      {
        name: "totalSupply",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "balanceOf",
        type: "function",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "transferFrom",
        type: "function",
        inputs: [
          {
            name: "sender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "constructor",
    type: "constructor",
    inputs: [
      {
        name: "name",
        type: "core::byte_array::ByteArray"
      },
      {
        name: "symbol",
        type: "core::byte_array::ByteArray"
      },
      {
        name: "asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "config",
        type: "lst::lst::interface::Config"
      }
    ]
  },
  {
    kind: "struct",
    name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
    type: "event",
    members: [
      {
        kind: "data",
        name: "class_hash",
        type: "core::starknet::class_hash::ClassHash"
      }
    ]
  },
  {
    kind: "enum",
    name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Upgraded",
        type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded"
      }
    ]
  },
  {
    kind: "struct",
    name: "openzeppelin_security::pausable::PausableComponent::Paused",
    type: "event",
    members: [
      {
        kind: "data",
        name: "account",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "struct",
    name: "openzeppelin_security::pausable::PausableComponent::Unpaused",
    type: "event",
    members: [
      {
        kind: "data",
        name: "account",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "enum",
    name: "openzeppelin_security::pausable::PausableComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Paused",
        type: "openzeppelin_security::pausable::PausableComponent::Paused"
      },
      {
        kind: "nested",
        name: "Unpaused",
        type: "openzeppelin_security::pausable::PausableComponent::Unpaused"
      }
    ]
  },
  {
    kind: "enum",
    name: "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event",
    type: "event",
    variants: []
  },
  {
    kind: "struct",
    name: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
    type: "event",
    members: [
      {
        kind: "key",
        name: "previous_owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "key",
        name: "new_owner",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "struct",
    name: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
    type: "event",
    members: [
      {
        kind: "key",
        name: "previous_owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "key",
        name: "new_owner",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "enum",
    name: "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "OwnershipTransferred",
        type: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred"
      },
      {
        kind: "nested",
        name: "OwnershipTransferStarted",
        type: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted"
      }
    ]
  },
  {
    kind: "enum",
    name: "lst::utils::common::CommonComp::Event",
    type: "event",
    variants: []
  },
  {
    kind: "struct",
    name: "lst::lst::erc4626::ERC4626Component::Deposit",
    type: "event",
    members: [
      {
        kind: "key",
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "key",
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "assets",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "shares",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "struct",
    name: "lst::lst::erc4626::ERC4626Component::Withdraw",
    type: "event",
    members: [
      {
        kind: "key",
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "key",
        name: "receiver",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "key",
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "assets",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "shares",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "enum",
    name: "lst::lst::erc4626::ERC4626Component::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Deposit",
        type: "lst::lst::erc4626::ERC4626Component::Deposit"
      },
      {
        kind: "nested",
        name: "Withdraw",
        type: "lst::lst::erc4626::ERC4626Component::Withdraw"
      }
    ]
  },
  {
    kind: "struct",
    name: "openzeppelin_token::erc20::erc20::ERC20Component::Transfer",
    type: "event",
    members: [
      {
        kind: "key",
        name: "from",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "key",
        name: "to",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "value",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "struct",
    name: "openzeppelin_token::erc20::erc20::ERC20Component::Approval",
    type: "event",
    members: [
      {
        kind: "key",
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "key",
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "value",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "enum",
    name: "openzeppelin_token::erc20::erc20::ERC20Component::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Transfer",
        type: "openzeppelin_token::erc20::erc20::ERC20Component::Transfer"
      },
      {
        kind: "nested",
        name: "Approval",
        type: "openzeppelin_token::erc20::erc20::ERC20Component::Approval"
      }
    ]
  },
  {
    kind: "struct",
    name: "lst::lst::interface::DispatchToStake",
    type: "event",
    members: [
      {
        kind: "data",
        name: "delegator",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "amount",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "struct",
    name: "lst::lst::interface::DispatchToWithdrawQueue",
    type: "event",
    members: [
      {
        kind: "data",
        name: "amount",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "struct",
    name: "lst::lst::lst::LST::DelegatorUpdate",
    type: "event",
    members: [
      {
        kind: "data",
        name: "delegator",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "info",
        type: "lst::lst::interface::DelegatorInfo"
      }
    ]
  },
  {
    kind: "struct",
    name: "lst::lst::interface::Fee",
    type: "event",
    members: [
      {
        kind: "data",
        name: "amount",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "token",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "receiver",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "struct",
    name: "lst::lst::lst::LST::Referral",
    type: "event",
    members: [
      {
        kind: "data",
        name: "referrer",
        type: "core::byte_array::ByteArray"
      },
      {
        kind: "data",
        name: "referee",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "assets",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "enum",
    name: "lst::lst::lst::LST::Event",
    type: "event",
    variants: [
      {
        kind: "flat",
        name: "UpgradeableEvent",
        type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event"
      },
      {
        kind: "flat",
        name: "PausableEvent",
        type: "openzeppelin_security::pausable::PausableComponent::Event"
      },
      {
        kind: "flat",
        name: "ReentrancyGuardEvent",
        type: "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event"
      },
      {
        kind: "flat",
        name: "OwnableEvent",
        type: "openzeppelin_access::ownable::ownable::OwnableComponent::Event"
      },
      {
        kind: "flat",
        name: "CommonCompEvent",
        type: "lst::utils::common::CommonComp::Event"
      },
      {
        kind: "flat",
        name: "ERC4626Event",
        type: "lst::lst::erc4626::ERC4626Component::Event"
      },
      {
        kind: "flat",
        name: "ERC20Event",
        type: "openzeppelin_token::erc20::erc20::ERC20Component::Event"
      },
      {
        kind: "nested",
        name: "DispatchToStake",
        type: "lst::lst::interface::DispatchToStake"
      },
      {
        kind: "nested",
        name: "DispatchToWithdrawQueue",
        type: "lst::lst::interface::DispatchToWithdrawQueue"
      },
      {
        kind: "nested",
        name: "DelegatorUpdate",
        type: "lst::lst::lst::LST::DelegatorUpdate"
      },
      {
        kind: "nested",
        name: "Fee",
        type: "lst::lst::interface::Fee"
      },
      {
        kind: "nested",
        name: "Referral",
        type: "lst::lst::lst::LST::Referral"
      }
    ]
  }
];

// src/services/protocols/lst.ts
var LST_CONFIG = {
  mainnet: {
    xSTRK: {
      address: CONTRACTS.mainnet.lst,
      deploymentBlock: 929092
    }
  },
  testnet: {
    xSTRK: {
      address: CONTRACTS.testnet.lst,
      deploymentBlock: 0
    }
  }
};
var LSTHoldingsService = class extends BaseHoldingsService {
  constructor(config) {
    super(config);
    this.config = LST_CONFIG[config.config.network] || LST_CONFIG.mainnet;
  }
  async getHoldings(request) {
    try {
      this.validateProvider();
      this.validateAddress(request.address);
      const { address, blockNumber } = request;
      const holdings = await this.getXSTRKHoldings(address, blockNumber);
      return {
        success: true,
        data: holdings,
        protocol: "lst",
        timestamp: Date.now()
      };
    } catch (error) {
      console.log("error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        protocol: "lst",
        timestamp: Date.now()
      };
    }
  }
  async getXSTRKHoldings(address, blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.xSTRK.deploymentBlock)) {
      return this.createZeroHoldings();
    }
    const lstContract = new Contract(erc4626_abi_default, this.config.xSTRK.address, this.provider);
    const balance = await lstContract.call("balance_of", [address], {
      blockIdentifier: blockNumber ?? "pending"
    });
    return {
      xSTRKAmount: balance.toString(),
      STRKAmount: "0"
    };
  }
  async getTotalAssets(blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.xSTRK.deploymentBlock)) {
      return "0";
    }
    const lstContract = new Contract(erc4626_abi_default, this.config.xSTRK.address, this.provider);
    const totalAssets = await lstContract.call("total_assets", [], {
      blockIdentifier: blockNumber ?? "pending"
    });
    return totalAssets.toString();
  }
  async getTotalSupply(blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.xSTRK.deploymentBlock)) {
      return "0";
    }
    const lstContract = new Contract(erc4626_abi_default, this.config.xSTRK.address, this.provider);
    const totalSupply = await lstContract.call("total_supply", [], {
      blockIdentifier: blockNumber ?? "pending"
    });
    return totalSupply.toString();
  }
  async getExchangeRate(blockNumber) {
    const totalAssets = await this.getTotalAssets(blockNumber);
    const totalSupply = await this.getTotalSupply(blockNumber);
    if (BigInt(totalSupply) === 0n) {
      return "0";
    }
    return (BigInt(totalAssets) * BigInt(10 ** 18) / BigInt(totalSupply)).toString();
  }
  async convertXSTRKToSTRK(xSTRKAmount, blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.xSTRK.deploymentBlock)) {
      return "0";
    }
    const lstContract = new Contract(erc4626_abi_default, this.config.xSTRK.address, this.provider);
    const strkAmount = await lstContract.call("convert_to_assets", [xSTRKAmount], {
      blockIdentifier: blockNumber ?? "pending"
    });
    return strkAmount.toString();
  }
};

// src/abis/ekubo.position.abi.json
var ekubo_position_abi_default = [
  {
    type: "impl",
    name: "PositionsHasInterface",
    interface_name: "ekubo::components::upgradeable::IHasInterface"
  },
  {
    type: "interface",
    name: "ekubo::components::upgradeable::IHasInterface",
    items: [
      {
        type: "function",
        name: "get_primary_interface_id",
        inputs: [],
        outputs: [
          {
            type: "core::felt252"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    type: "impl",
    name: "ILockerImpl",
    interface_name: "ekubo::interfaces::core::ILocker"
  },
  {
    type: "struct",
    name: "core::array::Span::<core::felt252>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    type: "interface",
    name: "ekubo::interfaces::core::ILocker",
    items: [
      {
        type: "function",
        name: "locked",
        inputs: [
          {
            name: "id",
            type: "core::integer::u32"
          },
          {
            name: "data",
            type: "core::array::Span::<core::felt252>"
          }
        ],
        outputs: [
          {
            type: "core::array::Span::<core::felt252>"
          }
        ],
        state_mutability: "external"
      }
    ]
  },
  {
    type: "impl",
    name: "PositionsImpl",
    interface_name: "ekubo::interfaces::positions::IPositions"
  },
  {
    type: "struct",
    name: "ekubo::types::keys::PoolKey",
    members: [
      {
        name: "token0",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token1",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "fee",
        type: "core::integer::u128"
      },
      {
        name: "tick_spacing",
        type: "core::integer::u128"
      },
      {
        name: "extension",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    type: "enum",
    name: "core::bool",
    variants: [
      {
        name: "False",
        type: "()"
      },
      {
        name: "True",
        type: "()"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::types::i129::i129",
    members: [
      {
        name: "mag",
        type: "core::integer::u128"
      },
      {
        name: "sign",
        type: "core::bool"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::types::bounds::Bounds",
    members: [
      {
        name: "lower",
        type: "ekubo::types::i129::i129"
      },
      {
        name: "upper",
        type: "ekubo::types::i129::i129"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::interfaces::positions::GetTokenInfoRequest",
    members: [
      {
        name: "id",
        type: "core::integer::u64"
      },
      {
        name: "pool_key",
        type: "ekubo::types::keys::PoolKey"
      },
      {
        name: "bounds",
        type: "ekubo::types::bounds::Bounds"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<ekubo::interfaces::positions::GetTokenInfoRequest>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<ekubo::interfaces::positions::GetTokenInfoRequest>"
      }
    ]
  },
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      {
        name: "low",
        type: "core::integer::u128"
      },
      {
        name: "high",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::types::pool_price::PoolPrice",
    members: [
      {
        name: "sqrt_ratio",
        type: "core::integer::u256"
      },
      {
        name: "tick",
        type: "ekubo::types::i129::i129"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::interfaces::positions::GetTokenInfoResult",
    members: [
      {
        name: "pool_price",
        type: "ekubo::types::pool_price::PoolPrice"
      },
      {
        name: "liquidity",
        type: "core::integer::u128"
      },
      {
        name: "amount0",
        type: "core::integer::u128"
      },
      {
        name: "amount1",
        type: "core::integer::u128"
      },
      {
        name: "fees0",
        type: "core::integer::u128"
      },
      {
        name: "fees1",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<ekubo::interfaces::positions::GetTokenInfoResult>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<ekubo::interfaces::positions::GetTokenInfoResult>"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::interfaces::extensions::twamm::OrderKey",
    members: [
      {
        name: "sell_token",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "buy_token",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "fee",
        type: "core::integer::u128"
      },
      {
        name: "start_time",
        type: "core::integer::u64"
      },
      {
        name: "end_time",
        type: "core::integer::u64"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<(core::integer::u64, ekubo::interfaces::extensions::twamm::OrderKey)>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<(core::integer::u64, ekubo::interfaces::extensions::twamm::OrderKey)>"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::interfaces::extensions::twamm::OrderInfo",
    members: [
      {
        name: "sale_rate",
        type: "core::integer::u128"
      },
      {
        name: "remaining_sell_amount",
        type: "core::integer::u128"
      },
      {
        name: "purchased_amount",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<ekubo::interfaces::extensions::twamm::OrderInfo>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<ekubo::interfaces::extensions::twamm::OrderInfo>"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::interfaces::extensions::limit_orders::OrderKey",
    members: [
      {
        name: "token0",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token1",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "tick",
        type: "ekubo::types::i129::i129"
      }
    ]
  },
  {
    type: "enum",
    name: "core::option::Option::<(core::integer::u64, core::integer::u128)>",
    variants: [
      {
        name: "Some",
        type: "(core::integer::u64, core::integer::u128)"
      },
      {
        name: "None",
        type: "()"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<(core::integer::u64, ekubo::interfaces::extensions::limit_orders::OrderKey)>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<(core::integer::u64, ekubo::interfaces::extensions::limit_orders::OrderKey)>"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::interfaces::extensions::limit_orders::OrderState",
    members: [
      {
        name: "initialized_ticks_crossed_snapshot",
        type: "core::integer::u64"
      },
      {
        name: "liquidity",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::interfaces::extensions::limit_orders::GetOrderInfoResult",
    members: [
      {
        name: "state",
        type: "ekubo::interfaces::extensions::limit_orders::OrderState"
      },
      {
        name: "executed",
        type: "core::bool"
      },
      {
        name: "amount0",
        type: "core::integer::u128"
      },
      {
        name: "amount1",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<ekubo::interfaces::extensions::limit_orders::GetOrderInfoResult>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<ekubo::interfaces::extensions::limit_orders::GetOrderInfoResult>"
      }
    ]
  },
  {
    type: "interface",
    name: "ekubo::interfaces::positions::IPositions",
    items: [
      {
        type: "function",
        name: "get_nft_address",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "upgrade_nft",
        inputs: [
          {
            name: "class_hash",
            type: "core::starknet::class_hash::ClassHash"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "set_twamm",
        inputs: [
          {
            name: "twamm_address",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "set_limit_orders",
        inputs: [
          {
            name: "limit_orders_address",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "get_twamm_address",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_limit_orders_address",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_tokens_info",
        inputs: [
          {
            name: "params",
            type: "core::array::Span::<ekubo::interfaces::positions::GetTokenInfoRequest>"
          }
        ],
        outputs: [
          {
            type: "core::array::Span::<ekubo::interfaces::positions::GetTokenInfoResult>"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_token_info",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          }
        ],
        outputs: [
          {
            type: "ekubo::interfaces::positions::GetTokenInfoResult"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_orders_info_with_block_timestamp",
        inputs: [
          {
            name: "params",
            type: "core::array::Span::<(core::integer::u64, ekubo::interfaces::extensions::twamm::OrderKey)>"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u64, core::array::Span::<ekubo::interfaces::extensions::twamm::OrderInfo>)"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_orders_info",
        inputs: [
          {
            name: "params",
            type: "core::array::Span::<(core::integer::u64, ekubo::interfaces::extensions::twamm::OrderKey)>"
          }
        ],
        outputs: [
          {
            type: "core::array::Span::<ekubo::interfaces::extensions::twamm::OrderInfo>"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_order_info",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::twamm::OrderKey"
          }
        ],
        outputs: [
          {
            type: "ekubo::interfaces::extensions::twamm::OrderInfo"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "mint",
        inputs: [
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          }
        ],
        outputs: [
          {
            type: "core::integer::u64"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "mint_with_referrer",
        inputs: [
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "referrer",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u64"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "mint_v2",
        inputs: [
          {
            name: "referrer",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u64"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "check_liquidity_is_zero",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          }
        ],
        outputs: [],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "unsafe_burn",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "deposit_last",
        inputs: [
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "min_liquidity",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "deposit_amounts_last",
        inputs: [
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "amount0",
            type: "core::integer::u128"
          },
          {
            name: "amount1",
            type: "core::integer::u128"
          },
          {
            name: "min_liquidity",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "deposit",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "min_liquidity",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "deposit_amounts",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "amount0",
            type: "core::integer::u128"
          },
          {
            name: "amount1",
            type: "core::integer::u128"
          },
          {
            name: "min_liquidity",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "mint_and_deposit",
        inputs: [
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "min_liquidity",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u64, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "mint_and_deposit_with_referrer",
        inputs: [
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "min_liquidity",
            type: "core::integer::u128"
          },
          {
            name: "referrer",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u64, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "mint_and_deposit_and_clear_both",
        inputs: [
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "min_liquidity",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u64, core::integer::u128, core::integer::u256, core::integer::u256)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "collect_fees",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "withdraw",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "liquidity",
            type: "core::integer::u128"
          },
          {
            name: "min_token0",
            type: "core::integer::u128"
          },
          {
            name: "min_token1",
            type: "core::integer::u128"
          },
          {
            name: "collect_fees",
            type: "core::bool"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "withdraw_v2",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          },
          {
            name: "bounds",
            type: "ekubo::types::bounds::Bounds"
          },
          {
            name: "liquidity",
            type: "core::integer::u128"
          },
          {
            name: "min_token0",
            type: "core::integer::u128"
          },
          {
            name: "min_token1",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "get_pool_price",
        inputs: [
          {
            name: "pool_key",
            type: "ekubo::types::keys::PoolKey"
          }
        ],
        outputs: [
          {
            type: "ekubo::types::pool_price::PoolPrice"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "mint_and_increase_sell_amount",
        inputs: [
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::twamm::OrderKey"
          },
          {
            name: "amount",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u64, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "increase_sell_amount_last",
        inputs: [
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::twamm::OrderKey"
          },
          {
            name: "amount",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "increase_sell_amount",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::twamm::OrderKey"
          },
          {
            name: "amount",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "decrease_sale_rate_to",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::twamm::OrderKey"
          },
          {
            name: "sale_rate_delta",
            type: "core::integer::u128"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "decrease_sale_rate_to_self",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::twamm::OrderKey"
          },
          {
            name: "sale_rate_delta",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "withdraw_proceeds_from_sale_to_self",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::twamm::OrderKey"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "withdraw_proceeds_from_sale_to",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::twamm::OrderKey"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "swap_to_limit_order_price",
        inputs: [
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::limit_orders::OrderKey"
          },
          {
            name: "amount",
            type: "core::integer::u128"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "swap_to_limit_order_price_and_maybe_mint_and_place_limit_order_to",
        inputs: [
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::limit_orders::OrderKey"
          },
          {
            name: "amount",
            type: "core::integer::u128"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u128, core::option::Option::<(core::integer::u64, core::integer::u128)>)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "swap_to_limit_order_price_and_maybe_mint_and_place_limit_order",
        inputs: [
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::limit_orders::OrderKey"
          },
          {
            name: "amount",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u128, core::option::Option::<(core::integer::u64, core::integer::u128)>)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "place_limit_order",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::limit_orders::OrderKey"
          },
          {
            name: "amount",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "maybe_mint_and_place_limit_order",
        inputs: [
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::limit_orders::OrderKey"
          },
          {
            name: "amount",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "core::option::Option::<(core::integer::u64, core::integer::u128)>"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "mint_and_place_limit_order",
        inputs: [
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::limit_orders::OrderKey"
          },
          {
            name: "amount",
            type: "core::integer::u128"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u64, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "close_limit_order",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::limit_orders::OrderKey"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "close_limit_order_to",
        inputs: [
          {
            name: "id",
            type: "core::integer::u64"
          },
          {
            name: "order_key",
            type: "ekubo::interfaces::extensions::limit_orders::OrderKey"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u128)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "get_limit_orders_info",
        inputs: [
          {
            name: "params",
            type: "core::array::Span::<(core::integer::u64, ekubo::interfaces::extensions::limit_orders::OrderKey)>"
          }
        ],
        outputs: [
          {
            type: "core::array::Span::<ekubo::interfaces::extensions::limit_orders::GetOrderInfoResult>"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    type: "impl",
    name: "Owned",
    interface_name: "ekubo::components::owned::IOwned"
  },
  {
    type: "interface",
    name: "ekubo::components::owned::IOwned",
    items: [
      {
        type: "function",
        name: "get_owner",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "transfer_ownership",
        inputs: [
          {
            name: "new_owner",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      }
    ]
  },
  {
    type: "impl",
    name: "Upgradeable",
    interface_name: "ekubo::interfaces::upgradeable::IUpgradeable"
  },
  {
    type: "interface",
    name: "ekubo::interfaces::upgradeable::IUpgradeable",
    items: [
      {
        type: "function",
        name: "replace_class_hash",
        inputs: [
          {
            name: "class_hash",
            type: "core::starknet::class_hash::ClassHash"
          }
        ],
        outputs: [],
        state_mutability: "external"
      }
    ]
  },
  {
    type: "impl",
    name: "Clear",
    interface_name: "ekubo::components::clear::IClear"
  },
  {
    type: "struct",
    name: "ekubo::interfaces::erc20::IERC20Dispatcher",
    members: [
      {
        name: "contract_address",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    type: "interface",
    name: "ekubo::components::clear::IClear",
    items: [
      {
        type: "function",
        name: "clear",
        inputs: [
          {
            name: "token",
            type: "ekubo::interfaces::erc20::IERC20Dispatcher"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "clear_minimum",
        inputs: [
          {
            name: "token",
            type: "ekubo::interfaces::erc20::IERC20Dispatcher"
          },
          {
            name: "minimum",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "clear_minimum_to_recipient",
        inputs: [
          {
            name: "token",
            type: "ekubo::interfaces::erc20::IERC20Dispatcher"
          },
          {
            name: "minimum",
            type: "core::integer::u256"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    type: "impl",
    name: "Expires",
    interface_name: "ekubo::components::expires::IExpires"
  },
  {
    type: "interface",
    name: "ekubo::components::expires::IExpires",
    items: [
      {
        type: "function",
        name: "expires",
        inputs: [
          {
            name: "at",
            type: "core::integer::u64"
          }
        ],
        outputs: [],
        state_mutability: "view"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::interfaces::core::ICoreDispatcher",
    members: [
      {
        name: "contract_address",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    type: "constructor",
    name: "constructor",
    inputs: [
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "core",
        type: "ekubo::interfaces::core::ICoreDispatcher"
      },
      {
        name: "nft_class_hash",
        type: "core::starknet::class_hash::ClassHash"
      },
      {
        name: "token_uri_base",
        type: "core::felt252"
      }
    ]
  },
  {
    type: "event",
    name: "ekubo::components::upgradeable::Upgradeable::ClassHashReplaced",
    kind: "struct",
    members: [
      {
        name: "new_class_hash",
        type: "core::starknet::class_hash::ClassHash",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "ekubo::components::upgradeable::Upgradeable::Event",
    kind: "enum",
    variants: [
      {
        name: "ClassHashReplaced",
        type: "ekubo::components::upgradeable::Upgradeable::ClassHashReplaced",
        kind: "nested"
      }
    ]
  },
  {
    type: "event",
    name: "ekubo::components::owned::Owned::OwnershipTransferred",
    kind: "struct",
    members: [
      {
        name: "old_owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data"
      },
      {
        name: "new_owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "ekubo::components::owned::Owned::Event",
    kind: "enum",
    variants: [
      {
        name: "OwnershipTransferred",
        type: "ekubo::components::owned::Owned::OwnershipTransferred",
        kind: "nested"
      }
    ]
  },
  {
    type: "event",
    name: "ekubo::positions::Positions::PositionMintedWithReferrer",
    kind: "struct",
    members: [
      {
        name: "id",
        type: "core::integer::u64",
        kind: "data"
      },
      {
        name: "referrer",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "ekubo::positions::Positions::Event",
    kind: "enum",
    variants: [
      {
        name: "UpgradeableEvent",
        type: "ekubo::components::upgradeable::Upgradeable::Event",
        kind: "flat"
      },
      {
        name: "OwnedEvent",
        type: "ekubo::components::owned::Owned::Event",
        kind: "nested"
      },
      {
        name: "PositionMintedWithReferrer",
        type: "ekubo::positions::Positions::PositionMintedWithReferrer",
        kind: "nested"
      }
    ]
  }
];
var defaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore"
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all"
  }
};
function getApolloClient(network) {
  return new ApolloClient({
    uri: network === "mainnet" ? "https://graphql.mainnet.endur.fi" : "https://graphql.sepolia.endur.fi",
    cache: new InMemoryCache(),
    defaultOptions
  });
}

// src/services/protocols/ekubo.ts
var EKUBO_CONFIG = {
  mainnet: {
    xSTRKAddress: "0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a",
    positionAddress: "0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067",
    deploymentBlock: 165388
  },
  testnet: {
    xSTRKAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    positionAddress: "0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067",
    deploymentBlock: 165388
  }
};
var EKUBO_API_QUERY = gql`
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
var EkuboHoldingsService = class extends BaseHoldingsService {
  constructor(config) {
    super(config);
    this.config = EKUBO_CONFIG[config.config.network] || EKUBO_CONFIG.mainnet;
    this.apolloClient = getApolloClient(config.config.network);
  }
  async getHoldings(request) {
    try {
      this.validateProvider();
      this.validateAddress(request.address);
      const { address, blockNumber } = request;
      const holdings = await this.getEkuboHoldings(address, blockNumber);
      return {
        success: true,
        data: holdings,
        protocol: "ekubo",
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        protocol: "ekubo",
        timestamp: Date.now()
      };
    }
  }
  async getEkuboHoldings(address, blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.deploymentBlock)) {
      return this.createZeroHoldings();
    }
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);
    try {
      const blockInfo = await this.sdkConfig.provider.getBlock(blockNumber ?? "latest");
      const resp = await this.apolloClient.query({
        query: EKUBO_API_QUERY,
        variables: {
          userAddress: address.toLowerCase(),
          showClosed: false,
          // Fetch both open and closed positions
          toDateTime: new Date(blockInfo.timestamp * 1e3).toISOString()
        }
      });
      const ekuboPositionsResp = resp;
      if (!ekuboPositionsResp || !ekuboPositionsResp.data || !ekuboPositionsResp.data.getEkuboPositionsByUser) {
        throw new Error("Failed to fetch Ekubo positions data");
      }
      const ekuboPositions = ekuboPositionsResp.data.getEkuboPositionsByUser;
      const positionContract = new Contract(
        ekubo_position_abi_default,
        this.config.positionAddress,
        this.provider
      );
      for (const position of ekuboPositions) {
        if (!position.position_id) continue;
        const poolKey = {
          token0: this.config.xSTRKAddress,
          token1: CONTRACTS.mainnet.strk,
          fee: position.pool_fee,
          tick_spacing: position.pool_tick_spacing,
          extension: position.extension
        };
        try {
          const result = await positionContract.call(
            "get_token_info",
            [
              position.position_id,
              poolKey,
              {
                lower: {
                  mag: Math.abs(position.lower_bound),
                  sign: position.lower_bound < 0 ? 1 : 0
                },
                upper: {
                  mag: Math.abs(position.upper_bound),
                  sign: position.upper_bound < 0 ? 1 : 0
                }
              }
            ],
            {
              blockIdentifier: blockNumber ?? "pending"
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
        } catch (error) {
          if (error.message.includes("NOT_INITIALIZED")) {
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error fetching Ekubo positions:", error);
    }
    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString()
    };
  }
};
var NOSTRA_CONFIG = {
  mainnet: {
    contracts: {
      nXSTRK: {
        address: "0x06878fd475d5cea090934d690ecbe4ad78503124e4f80380a2e45eb417aafb9c",
        deploymentBlock: 968482
      },
      nXSTRKC: {
        address: "0x01b8d8e31f9dd1bde7dc878dd871225504837c78c40ff01cbf03a255e2154bf0",
        deploymentBlock: 968483
      },
      iXSTRK: {
        address: "0x04d1125a716f547a0b69413c0098e811da3b799d173429c95da4290a00c139f7",
        deploymentBlock: 968483
      },
      iXSTRKC: {
        address: "0x0257afe480da9255a026127cd3a295a580ef316b297a69be22b89729ae8c1d2a",
        deploymentBlock: 968484
      },
      dXSTRK: {
        address: "0x0424638c9060d08b4820aabbb28347fc7234e2b7aadab58ad0f101e2412ea42d",
        deploymentBlock: 968481
      }
    }
  },
  testnet: {
    contracts: {
      nXSTRK: {
        address: "0x06878fd475d5cea090934d690ecbe4ad78503124e4f80380a2e45eb417aafb9c",
        deploymentBlock: 968482
      },
      nXSTRKC: {
        address: "0x01b8d8e31f9dd1bde7dc878dd871225504837c78c40ff01cbf03a255e2154bf0",
        deploymentBlock: 968483
      },
      iXSTRK: {
        address: "0x04d1125a716f547a0b69413c0098e811da3b799d173429c95da4290a00c139f7",
        deploymentBlock: 968483
      },
      iXSTRKC: {
        address: "0x0257afe480da9255a026127cd3a295a580ef316b297a69be22b89729ae8c1d2a",
        deploymentBlock: 968484
      },
      dXSTRK: {
        address: "0x0424638c9060d08b4820aabbb28347fc7234e2b7aadab58ad0f101e2412ea42d",
        deploymentBlock: 968481
      }
    }
  }
};
var NostraLendingHoldingsService = class extends BaseHoldingsService {
  constructor(config) {
    super(config);
    this.config = NOSTRA_CONFIG[config.config.network] || NOSTRA_CONFIG.mainnet;
  }
  async getHoldings(request) {
    try {
      this.validateProvider();
      this.validateAddress(request.address);
      const { address, blockNumber } = request;
      const holdings = await this.getNostraHoldings(address, blockNumber);
      return {
        success: true,
        data: holdings,
        protocol: "nostra",
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        protocol: "nostra",
        timestamp: Date.now()
      };
    }
  }
  async getNostraHoldings(address, blockNumber) {
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);
    const vaultHoldings = await Promise.all([
      this.getVaultHoldings(address, "nXSTRK", blockNumber),
      this.getVaultHoldings(address, "nXSTRKC", blockNumber),
      this.getVaultHoldings(address, "iXSTRK", blockNumber),
      this.getVaultHoldings(address, "iXSTRKC", blockNumber),
      this.getVaultHoldings(address, "dXSTRK", blockNumber)
    ]);
    for (const holding of vaultHoldings) {
      xSTRKAmount += BigInt(holding.xSTRKAmount);
      STRKAmount += BigInt(holding.STRKAmount);
    }
    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString()
    };
  }
  async getVaultHoldings(address, vaultType, blockNumber) {
    const contractConfig = this.config.contracts[vaultType];
    if (!this.isContractDeployed(blockNumber, contractConfig.deploymentBlock)) {
      return this.createZeroHoldings();
    }
    const contract = new Contract(erc4626_abi_default, contractConfig.address, this.provider);
    const balance = await contract.call("balance_of", [address], {
      blockIdentifier: blockNumber ?? "latest"
    });
    return {
      xSTRKAmount: balance.toString(),
      STRKAmount: "0"
    };
  }
  async getVaultHoldingsByType(address, vaultType, blockNumber) {
    return this.getVaultHoldings(address, vaultType, blockNumber);
  }
};

// src/abis/nostra.lp.abi.json
var nostra_lp_abi_default = [
  {
    name: "Pair",
    type: "impl",
    interface_name: "nostra_pools::interface::pair::IPair"
  },
  {
    name: "core::integer::u256",
    type: "struct",
    members: [
      {
        name: "low",
        type: "core::integer::u128"
      },
      {
        name: "high",
        type: "core::integer::u128"
      }
    ]
  },
  {
    name: "core::bool",
    type: "enum",
    variants: [
      {
        name: "False",
        type: "()"
      },
      {
        name: "True",
        type: "()"
      }
    ]
  },
  {
    name: "nostra_pools::interface::pair::IPair",
    type: "interface",
    items: [
      {
        name: "mint",
        type: "function",
        inputs: [
          {
            name: "to",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "burn",
        type: "function",
        inputs: [
          {
            name: "to",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u256, core::integer::u256)"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "swap",
        type: "function",
        inputs: [
          {
            name: "amount_0_out",
            type: "core::integer::u256"
          },
          {
            name: "amount_1_out",
            type: "core::integer::u256"
          },
          {
            name: "to",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "data",
            type: "core::array::Array::<core::felt252>"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "out_given_in",
        type: "function",
        inputs: [
          {
            name: "amount_in",
            type: "core::integer::u256"
          },
          {
            name: "first_token_in",
            type: "core::bool"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "in_given_out",
        type: "function",
        inputs: [
          {
            name: "amount_out",
            type: "core::integer::u256"
          },
          {
            name: "first_token_in",
            type: "core::bool"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    name: "StablePair",
    type: "impl",
    interface_name: "nostra_pools::interface::pair::IStablePair"
  },
  {
    name: "nostra_pools::stable_math::AmplificationData",
    type: "struct",
    members: [
      {
        name: "amp_start",
        type: "core::integer::u32"
      },
      {
        name: "amp_end",
        type: "core::integer::u32"
      },
      {
        name: "start_time",
        type: "core::integer::u64"
      },
      {
        name: "end_time",
        type: "core::integer::u64"
      }
    ]
  },
  {
    name: "nostra_pools::interface::pair::IStablePair",
    type: "interface",
    items: [
      {
        name: "start_amp_update",
        type: "function",
        inputs: [
          {
            name: "target_amp",
            type: "core::integer::u32"
          },
          {
            name: "duration",
            type: "core::integer::u64"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "stop_amp_update",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "set_rate_provider_0",
        type: "function",
        inputs: [
          {
            name: "rate_provider",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "set_rate_provider_1",
        type: "function",
        inputs: [
          {
            name: "rate_provider",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "amp_data",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "nostra_pools::stable_math::AmplificationData"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "get_rate_providers",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "(core::starknet::contract_address::ContractAddress, core::starknet::contract_address::ContractAddress)"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    name: "UpgradeableImpl",
    type: "impl",
    interface_name: "openzeppelin::upgrades::interface::IUpgradeable"
  },
  {
    name: "openzeppelin::upgrades::interface::IUpgradeable",
    type: "interface",
    items: [
      {
        name: "upgrade",
        type: "function",
        inputs: [
          {
            name: "new_class_hash",
            type: "core::starknet::class_hash::ClassHash"
          }
        ],
        outputs: [],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "OwnableImpl",
    type: "impl",
    interface_name: "openzeppelin::access::ownable::interface::IOwnable"
  },
  {
    name: "openzeppelin::access::ownable::interface::IOwnable",
    type: "interface",
    items: [
      {
        name: "owner",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "transfer_ownership",
        type: "function",
        inputs: [
          {
            name: "new_owner",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "renounce_ownership",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "ERC20Impl",
    type: "impl",
    interface_name: "openzeppelin::token::erc20::interface::IERC20"
  },
  {
    name: "openzeppelin::token::erc20::interface::IERC20",
    type: "interface",
    items: [
      {
        name: "total_supply",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "balance_of",
        type: "function",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "allowance",
        type: "function",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "transfer",
        type: "function",
        inputs: [
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "transfer_from",
        type: "function",
        inputs: [
          {
            name: "sender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "approve",
        type: "function",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "ERC20MetadataImpl",
    type: "impl",
    interface_name: "openzeppelin::token::erc20::interface::IERC20Metadata"
  },
  {
    name: "openzeppelin::token::erc20::interface::IERC20Metadata",
    type: "interface",
    items: [
      {
        name: "name",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::felt252"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "symbol",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::felt252"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "decimals",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u8"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    name: "ERC20CamelOnlyImpl",
    type: "impl",
    interface_name: "openzeppelin::token::erc20::interface::IERC20CamelOnly"
  },
  {
    name: "openzeppelin::token::erc20::interface::IERC20CamelOnly",
    type: "interface",
    items: [
      {
        name: "totalSupply",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "balanceOf",
        type: "function",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "transferFrom",
        type: "function",
        inputs: [
          {
            name: "sender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "SafeAllowanceImpl",
    type: "impl",
    interface_name: "openzeppelin::token::erc20::interface::ISafeAllowance"
  },
  {
    name: "openzeppelin::token::erc20::interface::ISafeAllowance",
    type: "interface",
    items: [
      {
        name: "increase_allowance",
        type: "function",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "added_value",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "decrease_allowance",
        type: "function",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "subtracted_value",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "SafeAllowanceCamelImpl",
    type: "impl",
    interface_name: "openzeppelin::token::erc20::interface::ISafeAllowanceCamel"
  },
  {
    name: "openzeppelin::token::erc20::interface::ISafeAllowanceCamel",
    type: "interface",
    items: [
      {
        name: "increaseAllowance",
        type: "function",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "addedValue",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      },
      {
        name: "decreaseAllowance",
        type: "function",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "subtractedValue",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      }
    ]
  },
  {
    name: "PairImpl",
    type: "impl",
    interface_name: "nostra_pools::interface::pair::IPairBase"
  },
  {
    name: "nostra_pools::interface::pair::IPairBase",
    type: "interface",
    items: [
      {
        name: "skim",
        type: "function",
        inputs: [
          {
            name: "to",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "sync",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "set_swap_fee",
        type: "function",
        inputs: [
          {
            name: "new_swap_fee",
            type: "core::integer::u128"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        name: "token_0",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "token_1",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "get_reserves",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "(core::integer::u256, core::integer::u256)"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "k_last",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        name: "swap_fee",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    name: "constructor",
    type: "constructor",
    inputs: [
      {
        name: "token_0",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token_1",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "initial_amp",
        type: "core::integer::u32"
      },
      {
        name: "rate_provider_0",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "rate_provider_1",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "struct",
    name: "openzeppelin::token::erc20::erc20::ERC20Component::Transfer",
    type: "event",
    members: [
      {
        kind: "key",
        name: "from",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "key",
        name: "to",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "value",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "struct",
    name: "openzeppelin::token::erc20::erc20::ERC20Component::Approval",
    type: "event",
    members: [
      {
        kind: "key",
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "key",
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "value",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "enum",
    name: "openzeppelin::token::erc20::erc20::ERC20Component::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Transfer",
        type: "openzeppelin::token::erc20::erc20::ERC20Component::Transfer"
      },
      {
        kind: "nested",
        name: "Approval",
        type: "openzeppelin::token::erc20::erc20::ERC20Component::Approval"
      }
    ]
  },
  {
    kind: "struct",
    name: "nostra_pools::pair_component::PairComponent::PairMint",
    type: "event",
    members: [
      {
        kind: "data",
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "amount_0",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "amount_1",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "struct",
    name: "nostra_pools::pair_component::PairComponent::PairBurn",
    type: "event",
    members: [
      {
        kind: "data",
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "amount_0",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "amount_1",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "to",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "struct",
    name: "nostra_pools::pair_component::PairComponent::Swap",
    type: "event",
    members: [
      {
        kind: "data",
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "amount_0_in",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "amount_1_in",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "amount_0_out",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "amount_1_out",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "to",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "struct",
    name: "nostra_pools::pair_component::PairComponent::Sync",
    type: "event",
    members: [
      {
        kind: "data",
        name: "reserve_0",
        type: "core::integer::u256"
      },
      {
        kind: "data",
        name: "reserve_1",
        type: "core::integer::u256"
      }
    ]
  },
  {
    kind: "enum",
    name: "nostra_pools::pair_component::PairComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "PairMint",
        type: "nostra_pools::pair_component::PairComponent::PairMint"
      },
      {
        kind: "nested",
        name: "PairBurn",
        type: "nostra_pools::pair_component::PairComponent::PairBurn"
      },
      {
        kind: "nested",
        name: "Swap",
        type: "nostra_pools::pair_component::PairComponent::Swap"
      },
      {
        kind: "nested",
        name: "Sync",
        type: "nostra_pools::pair_component::PairComponent::Sync"
      }
    ]
  },
  {
    kind: "enum",
    name: "openzeppelin::security::reentrancyguard::ReentrancyGuardComponent::Event",
    type: "event",
    variants: []
  },
  {
    kind: "struct",
    name: "openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferred",
    type: "event",
    members: [
      {
        kind: "data",
        name: "previous_owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "new_owner",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "enum",
    name: "openzeppelin::access::ownable::ownable::OwnableComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "OwnershipTransferred",
        type: "openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferred"
      }
    ]
  },
  {
    kind: "struct",
    name: "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded",
    type: "event",
    members: [
      {
        kind: "data",
        name: "class_hash",
        type: "core::starknet::class_hash::ClassHash"
      }
    ]
  },
  {
    kind: "enum",
    name: "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Upgraded",
        type: "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded"
      }
    ]
  },
  {
    kind: "struct",
    name: "nostra_pools::stable_pair::StablePair::AmplificationUpdateStarted",
    type: "event",
    members: [
      {
        kind: "data",
        name: "amp_start",
        type: "core::integer::u32"
      },
      {
        kind: "data",
        name: "amp_end",
        type: "core::integer::u32"
      },
      {
        kind: "data",
        name: "start_time",
        type: "core::integer::u64"
      },
      {
        kind: "data",
        name: "duration",
        type: "core::integer::u64"
      }
    ]
  },
  {
    kind: "struct",
    name: "nostra_pools::stable_pair::StablePair::AmplificationUpdateStopped",
    type: "event",
    members: [
      {
        kind: "data",
        name: "amp",
        type: "core::integer::u32"
      }
    ]
  },
  {
    kind: "struct",
    name: "nostra_pools::stable_pair::StablePair::RateProviderSet",
    type: "event",
    members: [
      {
        kind: "data",
        name: "token",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        kind: "data",
        name: "rate_provider",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    kind: "enum",
    name: "nostra_pools::stable_pair::StablePair::Event",
    type: "event",
    variants: [
      {
        kind: "flat",
        name: "ERC20Event",
        type: "openzeppelin::token::erc20::erc20::ERC20Component::Event"
      },
      {
        kind: "flat",
        name: "PairEvent",
        type: "nostra_pools::pair_component::PairComponent::Event"
      },
      {
        kind: "flat",
        name: "ReentrancyGuardEvent",
        type: "openzeppelin::security::reentrancyguard::ReentrancyGuardComponent::Event"
      },
      {
        kind: "flat",
        name: "OwnableEvent",
        type: "openzeppelin::access::ownable::ownable::OwnableComponent::Event"
      },
      {
        kind: "flat",
        name: "UpgradeableEvent",
        type: "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event"
      },
      {
        kind: "nested",
        name: "AmplificationUpdateStarted",
        type: "nostra_pools::stable_pair::StablePair::AmplificationUpdateStarted"
      },
      {
        kind: "nested",
        name: "AmplificationUpdateStopped",
        type: "nostra_pools::stable_pair::StablePair::AmplificationUpdateStopped"
      },
      {
        kind: "nested",
        name: "RateProviderSet",
        type: "nostra_pools::stable_pair::StablePair::RateProviderSet"
      }
    ]
  }
];

// src/services/protocols/nostraDex.ts
var NOSTRA_CONFIG2 = {
  mainnet: {
    contracts: {
      lpToken: {
        address: "0x00205fd8586f6be6c16f4aa65cc1034ecff96d96481878e55f629cd0cb83e05f",
        deploymentBlock: 940755
      }
    }
  },
  testnet: {
    contracts: {
      lpToken: {
        address: "0x00205fd8586f6be6c16f4aa65cc1034ecff96d96481878e55f629cd0cb83e05f",
        deploymentBlock: 940755
      }
    }
  }
};
var NostraDexHoldingsService = class extends BaseHoldingsService {
  constructor(config) {
    super(config);
    this.config = NOSTRA_CONFIG2[config.config.network] || NOSTRA_CONFIG2.mainnet;
  }
  async getHoldings(request) {
    try {
      this.validateProvider();
      this.validateAddress(request.address);
      const { address, blockNumber } = request;
      const holdings = await this.getNostraHoldings(address, blockNumber);
      return {
        success: true,
        data: holdings,
        protocol: "nostra",
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        protocol: "nostra",
        timestamp: Date.now()
      };
    }
  }
  async getNostraHoldings(address, blockNumber) {
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);
    const lpHoldings = await this.getLPHoldings(address, blockNumber);
    xSTRKAmount += BigInt(lpHoldings.xSTRKAmount);
    STRKAmount += BigInt(lpHoldings.STRKAmount);
    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString()
    };
  }
  async getLPHoldings(address, blockNumber) {
    const lpConfig = this.config.contracts.lpToken;
    if (!this.isContractDeployed(blockNumber, lpConfig.deploymentBlock)) {
      return this.createZeroHoldings();
    }
    const contract = new Contract(nostra_lp_abi_default, lpConfig.address, this.provider);
    const balance = await contract.call("balance_of", [address], {
      blockIdentifier: blockNumber ?? "latest"
    });
    const totalSupply = await contract.call("total_supply", [], {
      blockIdentifier: blockNumber ?? "latest"
    });
    const reserves = await contract.call("get_reserves", [], {
      blockIdentifier: blockNumber ?? "latest"
    });
    const balanceStr = balance.toString();
    const totalSupplyStr = totalSupply.toString();
    const reserve0Str = reserves[0].toString();
    const reserve1Str = reserves[1].toString();
    const balanceNum = Number(balanceStr);
    const totalSupplyNum = Number(totalSupplyStr);
    const reserve0Num = Number(reserve0Str);
    const reserve1Num = Number(reserve1Str);
    const xSTRKTokenBal = totalSupplyNum === 0 ? 0 : balanceNum / totalSupplyNum * reserve0Num;
    const STRKTokenBal = totalSupplyNum === 0 ? 0 : balanceNum / totalSupplyNum * reserve1Num;
    return {
      xSTRKAmount: BigInt(Math.floor(xSTRKTokenBal)).toString(),
      STRKAmount: BigInt(Math.floor(STRKTokenBal)).toString()
    };
  }
};

// src/abis/opus.abi.json
var opus_abi_default = [
  {
    type: "impl",
    name: "IAbbotImpl",
    interface_name: "opus::interfaces::IAbbot::IAbbot"
  },
  {
    type: "enum",
    name: "core::option::Option::<core::starknet::contract_address::ContractAddress>",
    variants: [
      {
        name: "Some",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "None",
        type: "()"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<core::integer::u64>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<core::integer::u64>"
      }
    ]
  },
  {
    type: "struct",
    name: "opus::types::AssetBalance",
    members: [
      {
        name: "address",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "amount",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<opus::types::AssetBalance>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<opus::types::AssetBalance>"
      }
    ]
  },
  {
    type: "struct",
    name: "wadray::wadray::Wad",
    members: [
      {
        name: "val",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "interface",
    name: "opus::interfaces::IAbbot::IAbbot",
    items: [
      {
        type: "function",
        name: "get_trove_owner",
        inputs: [
          {
            name: "trove_id",
            type: "core::integer::u64"
          }
        ],
        outputs: [
          {
            type: "core::option::Option::<core::starknet::contract_address::ContractAddress>"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_user_trove_ids",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::array::Span::<core::integer::u64>"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_troves_count",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u64"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_trove_asset_balance",
        inputs: [
          {
            name: "trove_id",
            type: "core::integer::u64"
          },
          {
            name: "yang",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "open_trove",
        inputs: [
          {
            name: "yang_assets",
            type: "core::array::Span::<opus::types::AssetBalance>"
          },
          {
            name: "forge_amount",
            type: "wadray::wadray::Wad"
          },
          {
            name: "max_forge_fee_pct",
            type: "wadray::wadray::Wad"
          }
        ],
        outputs: [
          {
            type: "core::integer::u64"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "close_trove",
        inputs: [
          {
            name: "trove_id",
            type: "core::integer::u64"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "deposit",
        inputs: [
          {
            name: "trove_id",
            type: "core::integer::u64"
          },
          {
            name: "yang_asset",
            type: "opus::types::AssetBalance"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "withdraw",
        inputs: [
          {
            name: "trove_id",
            type: "core::integer::u64"
          },
          {
            name: "yang_asset",
            type: "opus::types::AssetBalance"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "forge",
        inputs: [
          {
            name: "trove_id",
            type: "core::integer::u64"
          },
          {
            name: "amount",
            type: "wadray::wadray::Wad"
          },
          {
            name: "max_forge_fee_pct",
            type: "wadray::wadray::Wad"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "melt",
        inputs: [
          {
            name: "trove_id",
            type: "core::integer::u64"
          },
          {
            name: "amount",
            type: "wadray::wadray::Wad"
          }
        ],
        outputs: [],
        state_mutability: "external"
      }
    ]
  },
  {
    type: "constructor",
    name: "constructor",
    inputs: [
      {
        name: "shrine",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "sentinel",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    type: "event",
    name: "opus::utils::reentrancy_guard::reentrancy_guard_component::Event",
    kind: "enum",
    variants: []
  },
  {
    type: "event",
    name: "opus::core::abbot::abbot::Deposit",
    kind: "struct",
    members: [
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "trove_id",
        type: "core::integer::u64",
        kind: "key"
      },
      {
        name: "yang",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "yang_amt",
        type: "wadray::wadray::Wad",
        kind: "data"
      },
      {
        name: "asset_amt",
        type: "core::integer::u128",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "opus::core::abbot::abbot::Withdraw",
    kind: "struct",
    members: [
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "trove_id",
        type: "core::integer::u64",
        kind: "key"
      },
      {
        name: "yang",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "yang_amt",
        type: "wadray::wadray::Wad",
        kind: "data"
      },
      {
        name: "asset_amt",
        type: "core::integer::u128",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "opus::core::abbot::abbot::TroveOpened",
    kind: "struct",
    members: [
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "trove_id",
        type: "core::integer::u64",
        kind: "key"
      }
    ]
  },
  {
    type: "event",
    name: "opus::core::abbot::abbot::TroveClosed",
    kind: "struct",
    members: [
      {
        name: "trove_id",
        type: "core::integer::u64",
        kind: "key"
      }
    ]
  },
  {
    type: "event",
    name: "opus::core::abbot::abbot::Event",
    kind: "enum",
    variants: [
      {
        name: "ReentrancyGuardEvent",
        type: "opus::utils::reentrancy_guard::reentrancy_guard_component::Event",
        kind: "nested"
      },
      {
        name: "Deposit",
        type: "opus::core::abbot::abbot::Deposit",
        kind: "nested"
      },
      {
        name: "Withdraw",
        type: "opus::core::abbot::abbot::Withdraw",
        kind: "nested"
      },
      {
        name: "TroveOpened",
        type: "opus::core::abbot::abbot::TroveOpened",
        kind: "nested"
      },
      {
        name: "TroveClosed",
        type: "opus::core::abbot::abbot::TroveClosed",
        kind: "nested"
      }
    ]
  }
];

// src/services/protocols/opus.ts
var OPUS_CONFIG = {
  mainnet: {
    contract: {
      address: "0x04d0bb0a4c40012384e7c419e6eb3c637b28e8363fb66958b60d90505b9c072f",
      deploymentBlock: 973643
    },
    xSTRKAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
  },
  testnet: {
    contract: {
      address: "0x04d0bb0a4c40012384e7c419e6eb3c637b28e8363fb66958b60d90505b9c072f",
      deploymentBlock: 973643
    },
    xSTRKAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
  }
};
var OpusHoldingsService = class extends BaseHoldingsService {
  constructor(config) {
    super(config);
    this.config = OPUS_CONFIG[config.config.network] || OPUS_CONFIG.mainnet;
  }
  async getHoldings(request) {
    try {
      this.validateProvider();
      this.validateAddress(request.address);
      const { address, blockNumber } = request;
      const holdings = await this.getOpusHoldings(address, blockNumber);
      return {
        success: true,
        data: holdings,
        protocol: "opus",
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        protocol: "opus",
        timestamp: Date.now()
      };
    }
  }
  async getOpusHoldings(address, blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.contract.deploymentBlock)) {
      return this.createZeroHoldings();
    }
    const contract = new Contract(opus_abi_default, this.config.contract.address, this.provider);
    const userTroves = await contract.call("get_user_trove_ids", [address], {
      blockIdentifier: blockNumber ?? "latest"
    });
    if (!userTroves || userTroves.length === 0) {
      return this.createZeroHoldings();
    }
    const balancePromises = userTroves.map((troveId) => {
      return contract.call("get_trove_asset_balance", [troveId, this.config.xSTRKAddress], {
        blockIdentifier: blockNumber ?? "latest"
      });
    });
    const balances = await Promise.all(balancePromises);
    const xSTRKAmount = balances.reduce(
      (acc, balance) => acc + balance,
      BigInt(0)
    );
    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: "0"
    };
  }
  async getUserTroves(address, blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.contract.deploymentBlock)) {
      return [];
    }
    const contract = new Contract(opus_abi_default, this.config.contract.address, this.provider);
    const userTroves = await contract.call("get_user_trove_ids", [address], {
      blockIdentifier: blockNumber ?? "latest"
    });
    return userTroves || [];
  }
  async getTroveAssetBalance(troveId, assetAddress, blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.contract.deploymentBlock)) {
      return "0";
    }
    const contract = new Contract(opus_abi_default, this.config.contract.address, this.provider);
    const balance = await contract.call("get_trove_asset_balance", [troveId, assetAddress], {
      blockIdentifier: blockNumber ?? "latest"
    });
    return balance.toString();
  }
};

// src/abis/sensei.abi.json
var sensei_abi_default = [
  {
    type: "impl",
    name: "IStrategyCustomImpl",
    interface_name: "strkfarm::interfaces::ERC721Strategy::IStrategyCustom"
  },
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      {
        name: "low",
        type: "core::integer::u128"
      },
      {
        name: "high",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm::interfaces::IEkuboDistributor::Claim",
    members: [
      {
        name: "id",
        type: "core::integer::u64"
      },
      {
        name: "claimee",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "amount",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<core::felt252>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm::components::swap::Route",
    members: [
      {
        name: "token_from",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token_to",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "exchange_address",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "percent",
        type: "core::integer::u128"
      },
      {
        name: "additional_swap_params",
        type: "core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm::components::swap::AvnuMultiRouteSwap",
    members: [
      {
        name: "token_from_address",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token_from_amount",
        type: "core::integer::u256"
      },
      {
        name: "token_to_address",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token_to_amount",
        type: "core::integer::u256"
      },
      {
        name: "token_to_min_amount",
        type: "core::integer::u256"
      },
      {
        name: "beneficiary",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "integrator_fee_amount_bps",
        type: "core::integer::u128"
      },
      {
        name: "integrator_fee_recipient",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "routes",
        type: "core::array::Array::<strkfarm::components::swap::Route>"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm::interfaces::ERC721Strategy::Position",
    members: [
      {
        name: "acc1_supply_shares",
        type: "core::integer::u256"
      },
      {
        name: "acc1_borrow_shares",
        type: "core::integer::u256"
      },
      {
        name: "acc2_supply_shares",
        type: "core::integer::u256"
      },
      {
        name: "acc2_borrow_shares",
        type: "core::integer::u256"
      }
    ]
  },
  {
    type: "enum",
    name: "core::bool",
    variants: [
      {
        name: "False",
        type: "()"
      },
      {
        name: "True",
        type: "()"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm::interfaces::ERC721Strategy::PositionDescription",
    members: [
      {
        name: "estimated_size",
        type: "core::integer::u256"
      },
      {
        name: "deposit1",
        type: "core::integer::u256"
      },
      {
        name: "borrow1",
        type: "core::integer::u256"
      },
      {
        name: "deposit2",
        type: "core::integer::u256"
      },
      {
        name: "borrow2",
        type: "core::integer::u256"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm::interfaces::oracle::IPriceOracleDispatcher",
    members: [
      {
        name: "contract_address",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::interfaces::core::ICoreDispatcher",
    members: [
      {
        name: "contract_address",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm::components::ekuboSwap::IRouterDispatcher",
    members: [
      {
        name: "contract_address",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm::components::ekuboSwap::EkuboSwapStruct",
    members: [
      {
        name: "core",
        type: "ekubo::interfaces::core::ICoreDispatcher"
      },
      {
        name: "router",
        type: "strkfarm::components::ekuboSwap::IRouterDispatcher"
      }
    ]
  },
  {
    type: "interface",
    name: "strkfarm::interfaces::ERC721Strategy::IStrategyCustom",
    items: [
      {
        type: "function",
        name: "describe_position",
        inputs: [
          {
            name: "token_id",
            type: "core::felt252"
          }
        ],
        outputs: [
          {
            type: "(strkfarm::interfaces::ERC721Strategy::Position, strkfarm::interfaces::ERC721Strategy::PositionDescription)"
          }
        ],
        state_mutability: "view"
      }
    ]
  }
];

// src/abis/ekubo_strkfarm.abi.json
var ekubo_strkfarm_abi_default = [
  {
    type: "impl",
    name: "ExternalImpl",
    interface_name: "strkfarm_contracts::strategies::cl_vault::interface::IClVault"
  },
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      {
        name: "low",
        type: "core::integer::u128"
      },
      {
        name: "high",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::strategies::cl_vault::interface::MyPosition",
    members: [
      {
        name: "liquidity",
        type: "core::integer::u256"
      },
      {
        name: "amount0",
        type: "core::integer::u256"
      },
      {
        name: "amount1",
        type: "core::integer::u256"
      }
    ]
  },
  {
    type: "enum",
    name: "core::bool",
    variants: [
      {
        name: "False",
        type: "()"
      },
      {
        name: "True",
        type: "()"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::types::i129::i129",
    members: [
      {
        name: "mag",
        type: "core::integer::u128"
      },
      {
        name: "sign",
        type: "core::bool"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::interfaces::IEkuboCore::Bounds",
    members: [
      {
        name: "lower",
        type: "ekubo::types::i129::i129"
      },
      {
        name: "upper",
        type: "ekubo::types::i129::i129"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::interfaces::IEkuboCore::PositionKey",
    members: [
      {
        name: "salt",
        type: "core::integer::u64"
      },
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "bounds",
        type: "strkfarm_contracts::interfaces::IEkuboCore::Bounds"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::types::fees_per_liquidity::FeesPerLiquidity",
    members: [
      {
        name: "value0",
        type: "core::felt252"
      },
      {
        name: "value1",
        type: "core::felt252"
      }
    ]
  },
  {
    type: "struct",
    name: "ekubo::types::position::Position",
    members: [
      {
        name: "liquidity",
        type: "core::integer::u128"
      },
      {
        name: "fees_per_liquidity_inside_last",
        type: "ekubo::types::fees_per_liquidity::FeesPerLiquidity"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::interfaces::IEkuboDistributor::Claim",
    members: [
      {
        name: "id",
        type: "core::integer::u64"
      },
      {
        name: "claimee",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "amount",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<core::felt252>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::components::swap::Route",
    members: [
      {
        name: "token_from",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token_to",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "exchange_address",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "percent",
        type: "core::integer::u128"
      },
      {
        name: "additional_swap_params",
        type: "core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::components::swap::AvnuMultiRouteSwap",
    members: [
      {
        name: "token_from_address",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token_from_amount",
        type: "core::integer::u256"
      },
      {
        name: "token_to_address",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token_to_amount",
        type: "core::integer::u256"
      },
      {
        name: "token_to_min_amount",
        type: "core::integer::u256"
      },
      {
        name: "beneficiary",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "integrator_fee_amount_bps",
        type: "core::integer::u128"
      },
      {
        name: "integrator_fee_recipient",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "routes",
        type: "core::array::Array::<strkfarm_contracts::components::swap::Route>"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::interfaces::IEkuboCore::PoolKey",
    members: [
      {
        name: "token0",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "token1",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "fee",
        type: "core::integer::u128"
      },
      {
        name: "tick_spacing",
        type: "core::integer::u128"
      },
      {
        name: "extension",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::strategies::cl_vault::interface::FeeSettings",
    members: [
      {
        name: "fee_bps",
        type: "core::integer::u256"
      },
      {
        name: "fee_collector",
        type: "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::strategies::cl_vault::interface::ClSettings",
    members: [
      {
        name: "ekubo_positions_contract",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "bounds_settings",
        type: "strkfarm_contracts::interfaces::IEkuboCore::Bounds"
      },
      {
        name: "pool_key",
        type: "strkfarm_contracts::interfaces::IEkuboCore::PoolKey"
      },
      {
        name: "ekubo_positions_nft",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "contract_nft_id",
        type: "core::integer::u64"
      },
      {
        name: "ekubo_core",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "oracle",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "fee_settings",
        type: "strkfarm_contracts::strategies::cl_vault::interface::FeeSettings"
      }
    ]
  },
  {
    type: "interface",
    name: "strkfarm_contracts::strategies::cl_vault::interface::IClVault",
    items: [
      {
        type: "function",
        name: "deposit",
        inputs: [
          {
            name: "amount0",
            type: "core::integer::u256"
          },
          {
            name: "amount1",
            type: "core::integer::u256"
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "withdraw",
        inputs: [
          {
            name: "shares",
            type: "core::integer::u256"
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "strkfarm_contracts::strategies::cl_vault::interface::MyPosition"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "convert_to_shares",
        inputs: [
          {
            name: "amount0",
            type: "core::integer::u256"
          },
          {
            name: "amount1",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "convert_to_assets",
        inputs: [
          {
            name: "shares",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "strkfarm_contracts::strategies::cl_vault::interface::MyPosition"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "total_liquidity",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_position_key",
        inputs: [],
        outputs: [
          {
            type: "strkfarm_contracts::interfaces::IEkuboCore::PositionKey"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_position",
        inputs: [],
        outputs: [
          {
            type: "ekubo::types::position::Position"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "handle_fees",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "harvest",
        inputs: [
          {
            name: "rewardsContract",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "claim",
            type: "strkfarm_contracts::interfaces::IEkuboDistributor::Claim"
          },
          {
            name: "proof",
            type: "core::array::Span::<core::felt252>"
          },
          {
            name: "swapInfo1",
            type: "strkfarm_contracts::components::swap::AvnuMultiRouteSwap"
          },
          {
            name: "swapInfo2",
            type: "strkfarm_contracts::components::swap::AvnuMultiRouteSwap"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "get_settings",
        inputs: [],
        outputs: [
          {
            type: "strkfarm_contracts::strategies::cl_vault::interface::ClSettings"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "handle_unused",
        inputs: [
          {
            name: "swap_params",
            type: "strkfarm_contracts::components::swap::AvnuMultiRouteSwap"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "rebalance",
        inputs: [
          {
            name: "new_bounds",
            type: "strkfarm_contracts::interfaces::IEkuboCore::Bounds"
          },
          {
            name: "swap_params",
            type: "strkfarm_contracts::components::swap::AvnuMultiRouteSwap"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "set_settings",
        inputs: [
          {
            name: "fee_settings",
            type: "strkfarm_contracts::strategies::cl_vault::interface::FeeSettings"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "set_incentives_off",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      }
    ]
  },
  {
    type: "impl",
    name: "VesuERC20Impl",
    interface_name: "openzeppelin_token::erc20::interface::IERC20Mixin"
  },
  {
    type: "struct",
    name: "core::byte_array::ByteArray",
    members: [
      {
        name: "data",
        type: "core::array::Array::<core::bytes_31::bytes31>"
      },
      {
        name: "pending_word",
        type: "core::felt252"
      },
      {
        name: "pending_word_len",
        type: "core::integer::u32"
      }
    ]
  },
  {
    type: "interface",
    name: "openzeppelin_token::erc20::interface::IERC20Mixin",
    items: [
      {
        type: "function",
        name: "total_supply",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "balance_of",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "allowance",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "transfer",
        inputs: [
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "transfer_from",
        inputs: [
          {
            name: "sender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "approve",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [
          {
            type: "core::byte_array::ByteArray"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "symbol",
        inputs: [],
        outputs: [
          {
            type: "core::byte_array::ByteArray"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u8"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "totalSupply",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "balanceOf",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "transferFrom",
        inputs: [
          {
            name: "sender",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "external"
      }
    ]
  },
  {
    type: "impl",
    name: "RewardShareImpl",
    interface_name: "strkfarm_contracts::components::harvester::reward_shares::IRewardShare"
  },
  {
    type: "struct",
    name: "strkfarm_contracts::components::harvester::reward_shares::UserRewardsInfo",
    members: [
      {
        name: "pending_round_points",
        type: "core::integer::u128"
      },
      {
        name: "shares_owned",
        type: "core::integer::u128"
      },
      {
        name: "block_number",
        type: "core::integer::u64"
      },
      {
        name: "index",
        type: "core::integer::u32"
      }
    ]
  },
  {
    type: "struct",
    name: "strkfarm_contracts::components::harvester::reward_shares::RewardsInfo",
    members: [
      {
        name: "amount",
        type: "core::integer::u128"
      },
      {
        name: "shares",
        type: "core::integer::u128"
      },
      {
        name: "total_round_points",
        type: "core::integer::u128"
      },
      {
        name: "block_number",
        type: "core::integer::u64"
      }
    ]
  },
  {
    type: "interface",
    name: "strkfarm_contracts::components::harvester::reward_shares::IRewardShare",
    items: [
      {
        type: "function",
        name: "get_user_reward_info",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "strkfarm_contracts::components::harvester::reward_shares::UserRewardsInfo"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_rewards_info",
        inputs: [
          {
            name: "index",
            type: "core::integer::u32"
          }
        ],
        outputs: [
          {
            type: "strkfarm_contracts::components::harvester::reward_shares::RewardsInfo"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_total_rewards",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u32"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_total_unminted_shares",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u128"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "get_additional_shares",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u64, core::integer::u128)"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    type: "impl",
    name: "CommonCompImpl",
    interface_name: "strkfarm_contracts::interfaces::common::ICommon"
  },
  {
    type: "interface",
    name: "strkfarm_contracts::interfaces::common::ICommon",
    items: [
      {
        type: "function",
        name: "upgrade",
        inputs: [
          {
            name: "new_class",
            type: "core::starknet::class_hash::ClassHash"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "pause",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "unpause",
        inputs: [],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "is_paused",
        inputs: [],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "access_control",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      }
    ]
  },
  {
    type: "constructor",
    name: "constructor",
    inputs: [
      {
        name: "name",
        type: "core::byte_array::ByteArray"
      },
      {
        name: "symbol",
        type: "core::byte_array::ByteArray"
      },
      {
        name: "access_control",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "ekubo_positions_contract",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "bounds_settings",
        type: "strkfarm_contracts::interfaces::IEkuboCore::Bounds"
      },
      {
        name: "pool_key",
        type: "strkfarm_contracts::interfaces::IEkuboCore::PoolKey"
      },
      {
        name: "ekubo_positions_nft",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "ekubo_core",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "oracle",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "fee_settings",
        type: "strkfarm_contracts::strategies::cl_vault::interface::FeeSettings"
      }
    ]
  },
  {
    type: "event",
    name: "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event",
    kind: "enum",
    variants: []
  },
  {
    type: "event",
    name: "openzeppelin_token::erc20::erc20::ERC20Component::Transfer",
    kind: "struct",
    members: [
      {
        name: "from",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "to",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "value",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "openzeppelin_token::erc20::erc20::ERC20Component::Approval",
    kind: "struct",
    members: [
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "value",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "openzeppelin_token::erc20::erc20::ERC20Component::Event",
    kind: "enum",
    variants: [
      {
        name: "Transfer",
        type: "openzeppelin_token::erc20::erc20::ERC20Component::Transfer",
        kind: "nested"
      },
      {
        name: "Approval",
        type: "openzeppelin_token::erc20::erc20::ERC20Component::Approval",
        kind: "nested"
      }
    ]
  },
  {
    type: "event",
    name: "openzeppelin_introspection::src5::SRC5Component::Event",
    kind: "enum",
    variants: []
  },
  {
    type: "event",
    name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
    kind: "struct",
    members: [
      {
        name: "class_hash",
        type: "core::starknet::class_hash::ClassHash",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "Upgraded",
        type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
        kind: "nested"
      }
    ]
  },
  {
    type: "event",
    name: "openzeppelin_security::pausable::PausableComponent::Paused",
    kind: "struct",
    members: [
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "openzeppelin_security::pausable::PausableComponent::Unpaused",
    kind: "struct",
    members: [
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "openzeppelin_security::pausable::PausableComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "Paused",
        type: "openzeppelin_security::pausable::PausableComponent::Paused",
        kind: "nested"
      },
      {
        name: "Unpaused",
        type: "openzeppelin_security::pausable::PausableComponent::Unpaused",
        kind: "nested"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::components::common::CommonComp::Event",
    kind: "enum",
    variants: []
  },
  {
    type: "event",
    name: "strkfarm_contracts::components::harvester::reward_shares::RewardShareComponent::Rewards",
    kind: "struct",
    members: [
      {
        name: "index",
        type: "core::integer::u32",
        kind: "data"
      },
      {
        name: "info",
        type: "strkfarm_contracts::components::harvester::reward_shares::RewardsInfo",
        kind: "data"
      },
      {
        name: "total_reward_shares",
        type: "core::integer::u128",
        kind: "data"
      },
      {
        name: "timestamp",
        type: "core::integer::u64",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::components::harvester::reward_shares::RewardShareComponent::UserRewards",
    kind: "struct",
    members: [
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "info",
        type: "strkfarm_contracts::components::harvester::reward_shares::UserRewardsInfo",
        kind: "data"
      },
      {
        name: "total_reward_shares",
        type: "core::integer::u128",
        kind: "data"
      },
      {
        name: "timestamp",
        type: "core::integer::u64",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::components::harvester::reward_shares::RewardShareComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "Rewards",
        type: "strkfarm_contracts::components::harvester::reward_shares::RewardShareComponent::Rewards",
        kind: "nested"
      },
      {
        name: "UserRewards",
        type: "strkfarm_contracts::components::harvester::reward_shares::RewardShareComponent::UserRewards",
        kind: "nested"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::Deposit",
    kind: "struct",
    members: [
      {
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "assets",
        type: "core::integer::u256",
        kind: "data"
      },
      {
        name: "shares",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::Withdraw",
    kind: "struct",
    members: [
      {
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "receiver",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "assets",
        type: "core::integer::u256",
        kind: "data"
      },
      {
        name: "shares",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::Rebalance",
    kind: "struct",
    members: [
      {
        name: "old_bounds",
        type: "strkfarm_contracts::interfaces::IEkuboCore::Bounds",
        kind: "data"
      },
      {
        name: "old_liquidity",
        type: "core::integer::u256",
        kind: "data"
      },
      {
        name: "new_bounds",
        type: "strkfarm_contracts::interfaces::IEkuboCore::Bounds",
        kind: "data"
      },
      {
        name: "new_liquidity",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::HandleFees",
    kind: "struct",
    members: [
      {
        name: "token0_addr",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data"
      },
      {
        name: "token0_origin_bal",
        type: "core::integer::u256",
        kind: "data"
      },
      {
        name: "token0_deposited",
        type: "core::integer::u256",
        kind: "data"
      },
      {
        name: "token1_addr",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data"
      },
      {
        name: "token1_origin_bal",
        type: "core::integer::u256",
        kind: "data"
      },
      {
        name: "token1_deposited",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::strategies::cl_vault::interface::FeeSettings",
    kind: "struct",
    members: [
      {
        name: "fee_bps",
        type: "core::integer::u256",
        kind: "data"
      },
      {
        name: "fee_collector",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::HarvestEvent",
    kind: "struct",
    members: [
      {
        name: "rewardToken",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "rewardAmount",
        type: "core::integer::u256",
        kind: "data"
      },
      {
        name: "token0",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "token0Amount",
        type: "core::integer::u256",
        kind: "data"
      },
      {
        name: "token1",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "token1Amount",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::Event",
    kind: "enum",
    variants: [
      {
        name: "ReentrancyGuardEvent",
        type: "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event",
        kind: "flat"
      },
      {
        name: "ERC20Event",
        type: "openzeppelin_token::erc20::erc20::ERC20Component::Event",
        kind: "flat"
      },
      {
        name: "SRC5Event",
        type: "openzeppelin_introspection::src5::SRC5Component::Event",
        kind: "flat"
      },
      {
        name: "UpgradeableEvent",
        type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
        kind: "flat"
      },
      {
        name: "PausableEvent",
        type: "openzeppelin_security::pausable::PausableComponent::Event",
        kind: "flat"
      },
      {
        name: "CommonCompEvent",
        type: "strkfarm_contracts::components::common::CommonComp::Event",
        kind: "flat"
      },
      {
        name: "RewardShareEvent",
        type: "strkfarm_contracts::components::harvester::reward_shares::RewardShareComponent::Event",
        kind: "flat"
      },
      {
        name: "Deposit",
        type: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::Deposit",
        kind: "nested"
      },
      {
        name: "Withdraw",
        type: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::Withdraw",
        kind: "nested"
      },
      {
        name: "Rebalance",
        type: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::Rebalance",
        kind: "nested"
      },
      {
        name: "HandleFees",
        type: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::HandleFees",
        kind: "nested"
      },
      {
        name: "FeeSettings",
        type: "strkfarm_contracts::strategies::cl_vault::interface::FeeSettings",
        kind: "nested"
      },
      {
        name: "Harvest",
        type: "strkfarm_contracts::strategies::cl_vault::cl_vault::ConcLiquidityVault::HarvestEvent",
        kind: "nested"
      }
    ]
  }
];

// src/services/protocols/strkfarm.ts
var STRKFARM_CONFIG = {
  mainnet: {
    contracts: {
      xSTRKSensei: {
        address: "0x07023a5cadc8a5db80e4f0fde6b330cbd3c17bbbf9cb145cbabd7bd5e6fb7b0b",
        deploymentBlock: 1053807
      },
      ekuboXSTRKSTRK: {
        address: "0x01f083b98674bc21effee29ef443a00c7b9a500fd92cf30341a3da12c73f2324",
        deploymentBlock: 1209881
      }
    }
  },
  testnet: {
    contracts: {
      xSTRKSensei: {
        address: "0x07023a5cadc8a5db80e4f0fde6b330cbd3c17bbbf9cb145cbabd7bd5e6fb7b0b",
        deploymentBlock: 1053807
      },
      ekuboXSTRKSTRK: {
        address: "0x01f083b98674bc21effee29ef443a00c7b9a500fd92cf30341a3da12c73f2324",
        deploymentBlock: 1209881
      }
    }
  }
};
var STRKFarmSenseiHoldingsService = class extends BaseHoldingsService {
  constructor(config) {
    super(config);
    this.config = STRKFARM_CONFIG[config.config.network] || STRKFARM_CONFIG.mainnet;
  }
  async getHoldings(request) {
    try {
      this.validateProvider();
      this.validateAddress(request.address);
      const { address, blockNumber } = request;
      const holdings = await this.getSTRKFarmHoldings(address, blockNumber);
      return {
        success: true,
        data: holdings,
        protocol: "strkfarm",
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        protocol: "strkfarm",
        timestamp: Date.now()
      };
    }
  }
  async getSTRKFarmHoldings(address, blockNumber) {
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);
    const senseiHoldings = await this.getSenseiHoldings(address, blockNumber);
    xSTRKAmount += BigInt(senseiHoldings.xSTRKAmount);
    STRKAmount += BigInt(senseiHoldings.STRKAmount);
    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString()
    };
  }
  async getSenseiHoldings(address, blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.contracts.xSTRKSensei.deploymentBlock)) {
      return this.createZeroHoldings();
    }
    try {
      const contract = new Contract(sensei_abi_default, this.config.contracts.xSTRKSensei.address, this.provider);
      const info = await contract.call("describe_position", [address], {
        blockIdentifier: blockNumber ?? "pending"
      });
      const holdings = info[1];
      const xSTRKAmount = BigInt(holdings.deposit2.toString());
      return {
        xSTRKAmount: xSTRKAmount.toString(),
        STRKAmount: "0"
      };
    } catch (error) {
      return this.createZeroHoldings();
    }
  }
};
var STRKFarmEkuboHoldingsService = class extends BaseHoldingsService {
  constructor(config) {
    super(config);
    this.config = STRKFARM_CONFIG[config.config.network] || STRKFARM_CONFIG.mainnet;
  }
  async getHoldings(request) {
    try {
      this.validateProvider();
      this.validateAddress(request.address);
      const { address, blockNumber } = request;
      const holdings = await this.getSTRKFarmHoldings(address, blockNumber);
      return {
        success: true,
        data: holdings,
        protocol: "strkfarm",
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        protocol: "strkfarm",
        timestamp: Date.now()
      };
    }
  }
  async getSTRKFarmHoldings(address, blockNumber) {
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);
    const ekuboHoldings = await this.getEkuboSTRKFarmHoldings(address, blockNumber);
    xSTRKAmount += BigInt(ekuboHoldings.xSTRKAmount);
    STRKAmount += BigInt(ekuboHoldings.STRKAmount);
    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString()
    };
  }
  async getEkuboSTRKFarmHoldings(address, blockNumber) {
    if (!this.isContractDeployed(blockNumber, this.config.contracts.ekuboXSTRKSTRK.deploymentBlock)) {
      return this.createZeroHoldings();
    }
    const contract = new Contract(ekubo_strkfarm_abi_default, this.config.contracts.ekuboXSTRKSTRK.address, this.provider);
    const balance = await contract.call("balanceOf", [address], {
      blockIdentifier: blockNumber ?? "pending"
    });
    const assets = await contract.call("convert_to_assets", [balance.toString()], {
      blockIdentifier: blockNumber ?? "pending"
    });
    const xSTRKAmount = BigInt(assets.amount0.toString());
    const STRKAmount = BigInt(assets.amount1.toString());
    return {
      xSTRKAmount: xSTRKAmount.toString(),
      STRKAmount: STRKAmount.toString()
    };
  }
};

// src/abis/vesu.singleton.abi.json
var vesu_singleton_abi_default = [
  {
    type: "impl",
    name: "SingletonImpl",
    interface_name: "vesu::singleton::ISingleton"
  },
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      {
        name: "low",
        type: "core::integer::u128"
      },
      {
        name: "high",
        type: "core::integer::u128"
      }
    ]
  },
  {
    type: "enum",
    name: "core::bool",
    variants: [
      {
        name: "False",
        type: "()"
      },
      {
        name: "True",
        type: "()"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::AssetConfig",
    members: [
      {
        name: "total_collateral_shares",
        type: "core::integer::u256"
      },
      {
        name: "total_nominal_debt",
        type: "core::integer::u256"
      },
      {
        name: "reserve",
        type: "core::integer::u256"
      },
      {
        name: "max_utilization",
        type: "core::integer::u256"
      },
      {
        name: "floor",
        type: "core::integer::u256"
      },
      {
        name: "scale",
        type: "core::integer::u256"
      },
      {
        name: "is_legacy",
        type: "core::bool"
      },
      {
        name: "last_updated",
        type: "core::integer::u64"
      },
      {
        name: "last_rate_accumulator",
        type: "core::integer::u256"
      },
      {
        name: "last_full_utilization_rate",
        type: "core::integer::u256"
      },
      {
        name: "fee_rate",
        type: "core::integer::u256"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::LTVConfig",
    members: [
      {
        name: "max_ltv",
        type: "core::integer::u64"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::Position",
    members: [
      {
        name: "collateral_shares",
        type: "core::integer::u256"
      },
      {
        name: "nominal_debt",
        type: "core::integer::u256"
      }
    ]
  },
  {
    type: "struct",
    name: "alexandria_math::i257::i257",
    members: [
      {
        name: "abs",
        type: "core::integer::u256"
      },
      {
        name: "is_negative",
        type: "core::bool"
      }
    ]
  },
  {
    type: "enum",
    name: "vesu::data_model::AmountType",
    variants: [
      {
        name: "Delta",
        type: "()"
      },
      {
        name: "Target",
        type: "()"
      }
    ]
  },
  {
    type: "enum",
    name: "vesu::data_model::AmountDenomination",
    variants: [
      {
        name: "Native",
        type: "()"
      },
      {
        name: "Assets",
        type: "()"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::Amount",
    members: [
      {
        name: "amount_type",
        type: "vesu::data_model::AmountType"
      },
      {
        name: "denomination",
        type: "vesu::data_model::AmountDenomination"
      },
      {
        name: "value",
        type: "alexandria_math::i257::i257"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::AssetPrice",
    members: [
      {
        name: "value",
        type: "core::integer::u256"
      },
      {
        name: "is_valid",
        type: "core::bool"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::Context",
    members: [
      {
        name: "pool_id",
        type: "core::felt252"
      },
      {
        name: "extension",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "collateral_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "debt_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "collateral_asset_config",
        type: "vesu::data_model::AssetConfig"
      },
      {
        name: "debt_asset_config",
        type: "vesu::data_model::AssetConfig"
      },
      {
        name: "collateral_asset_price",
        type: "vesu::data_model::AssetPrice"
      },
      {
        name: "debt_asset_price",
        type: "vesu::data_model::AssetPrice"
      },
      {
        name: "collateral_asset_fee_shares",
        type: "core::integer::u256"
      },
      {
        name: "debt_asset_fee_shares",
        type: "core::integer::u256"
      },
      {
        name: "max_ltv",
        type: "core::integer::u64"
      },
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "position",
        type: "vesu::data_model::Position"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::AssetParams",
    members: [
      {
        name: "asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "floor",
        type: "core::integer::u256"
      },
      {
        name: "initial_rate_accumulator",
        type: "core::integer::u256"
      },
      {
        name: "initial_full_utilization_rate",
        type: "core::integer::u256"
      },
      {
        name: "max_utilization",
        type: "core::integer::u256"
      },
      {
        name: "is_legacy",
        type: "core::bool"
      },
      {
        name: "fee_rate",
        type: "core::integer::u256"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<vesu::data_model::AssetParams>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<vesu::data_model::AssetParams>"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::LTVParams",
    members: [
      {
        name: "collateral_asset_index",
        type: "core::integer::u32"
      },
      {
        name: "debt_asset_index",
        type: "core::integer::u32"
      },
      {
        name: "max_ltv",
        type: "core::integer::u64"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<vesu::data_model::LTVParams>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<vesu::data_model::LTVParams>"
      }
    ]
  },
  {
    type: "struct",
    name: "core::array::Span::<core::felt252>",
    members: [
      {
        name: "snapshot",
        type: "@core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::ModifyPositionParams",
    members: [
      {
        name: "pool_id",
        type: "core::felt252"
      },
      {
        name: "collateral_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "debt_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "collateral",
        type: "vesu::data_model::Amount"
      },
      {
        name: "debt",
        type: "vesu::data_model::Amount"
      },
      {
        name: "data",
        type: "core::array::Span::<core::felt252>"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::UpdatePositionResponse",
    members: [
      {
        name: "collateral_delta",
        type: "alexandria_math::i257::i257"
      },
      {
        name: "collateral_shares_delta",
        type: "alexandria_math::i257::i257"
      },
      {
        name: "debt_delta",
        type: "alexandria_math::i257::i257"
      },
      {
        name: "nominal_debt_delta",
        type: "alexandria_math::i257::i257"
      },
      {
        name: "bad_debt",
        type: "core::integer::u256"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::UnsignedAmount",
    members: [
      {
        name: "amount_type",
        type: "vesu::data_model::AmountType"
      },
      {
        name: "denomination",
        type: "vesu::data_model::AmountDenomination"
      },
      {
        name: "value",
        type: "core::integer::u256"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::TransferPositionParams",
    members: [
      {
        name: "pool_id",
        type: "core::felt252"
      },
      {
        name: "from_collateral_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "from_debt_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "to_collateral_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "to_debt_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "from_user",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "to_user",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "collateral",
        type: "vesu::data_model::UnsignedAmount"
      },
      {
        name: "debt",
        type: "vesu::data_model::UnsignedAmount"
      },
      {
        name: "from_data",
        type: "core::array::Span::<core::felt252>"
      },
      {
        name: "to_data",
        type: "core::array::Span::<core::felt252>"
      }
    ]
  },
  {
    type: "struct",
    name: "vesu::data_model::LiquidatePositionParams",
    members: [
      {
        name: "pool_id",
        type: "core::felt252"
      },
      {
        name: "collateral_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "debt_asset",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "receive_as_shares",
        type: "core::bool"
      },
      {
        name: "data",
        type: "core::array::Span::<core::felt252>"
      }
    ]
  },
  {
    type: "interface",
    name: "vesu::singleton::ISingleton",
    items: [
      {
        type: "function",
        name: "creator_nonce",
        inputs: [
          {
            name: "creator",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::felt252"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "extension",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          }
        ],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "asset_config_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(vesu::data_model::AssetConfig, core::integer::u256)"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "asset_config",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(vesu::data_model::AssetConfig, core::integer::u256)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "ltv_config",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "vesu::data_model::LTVConfig"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "position_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(vesu::data_model::Position, core::integer::u256, core::integer::u256)"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "position",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(vesu::data_model::Position, core::integer::u256, core::integer::u256)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "check_collateralization_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(core::bool, core::integer::u256, core::integer::u256)"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "check_collateralization",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "(core::bool, core::integer::u256, core::integer::u256)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "rate_accumulator_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "rate_accumulator",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "utilization_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "utilization",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "delegation",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "delegator",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "delegatee",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::bool"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "calculate_pool_id",
        inputs: [
          {
            name: "caller_address",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "nonce",
            type: "core::felt252"
          }
        ],
        outputs: [
          {
            type: "core::felt252"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "calculate_debt",
        inputs: [
          {
            name: "nominal_debt",
            type: "alexandria_math::i257::i257"
          },
          {
            name: "rate_accumulator",
            type: "core::integer::u256"
          },
          {
            name: "asset_scale",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "calculate_nominal_debt",
        inputs: [
          {
            name: "debt",
            type: "alexandria_math::i257::i257"
          },
          {
            name: "rate_accumulator",
            type: "core::integer::u256"
          },
          {
            name: "asset_scale",
            type: "core::integer::u256"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "calculate_collateral_shares_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "collateral",
            type: "alexandria_math::i257::i257"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "calculate_collateral_shares",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "collateral",
            type: "alexandria_math::i257::i257"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "calculate_collateral_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "collateral_shares",
            type: "alexandria_math::i257::i257"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "calculate_collateral",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "collateral_shares",
            type: "alexandria_math::i257::i257"
          }
        ],
        outputs: [
          {
            type: "core::integer::u256"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "deconstruct_collateral_amount_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "collateral",
            type: "vesu::data_model::Amount"
          }
        ],
        outputs: [
          {
            type: "(alexandria_math::i257::i257, alexandria_math::i257::i257)"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "deconstruct_collateral_amount",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "collateral",
            type: "vesu::data_model::Amount"
          }
        ],
        outputs: [
          {
            type: "(alexandria_math::i257::i257, alexandria_math::i257::i257)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "deconstruct_debt_amount_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt",
            type: "vesu::data_model::Amount"
          }
        ],
        outputs: [
          {
            type: "(alexandria_math::i257::i257, alexandria_math::i257::i257)"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "deconstruct_debt_amount",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt",
            type: "vesu::data_model::Amount"
          }
        ],
        outputs: [
          {
            type: "(alexandria_math::i257::i257, alexandria_math::i257::i257)"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "context_unsafe",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "vesu::data_model::Context"
          }
        ],
        state_mutability: "view"
      },
      {
        type: "function",
        name: "context",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "vesu::data_model::Context"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "create_pool",
        inputs: [
          {
            name: "asset_params",
            type: "core::array::Span::<vesu::data_model::AssetParams>"
          },
          {
            name: "ltv_params",
            type: "core::array::Span::<vesu::data_model::LTVParams>"
          },
          {
            name: "extension",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [
          {
            type: "core::felt252"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "modify_position",
        inputs: [
          {
            name: "params",
            type: "vesu::data_model::ModifyPositionParams"
          }
        ],
        outputs: [
          {
            type: "vesu::data_model::UpdatePositionResponse"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "transfer_position",
        inputs: [
          {
            name: "params",
            type: "vesu::data_model::TransferPositionParams"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "liquidate_position",
        inputs: [
          {
            name: "params",
            type: "vesu::data_model::LiquidatePositionParams"
          }
        ],
        outputs: [
          {
            type: "vesu::data_model::UpdatePositionResponse"
          }
        ],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "flash_loan",
        inputs: [
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          },
          {
            name: "is_legacy",
            type: "core::bool"
          },
          {
            name: "data",
            type: "core::array::Span::<core::felt252>"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "modify_delegation",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "delegatee",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "delegation",
            type: "core::bool"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "donate_to_reserve",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "retrieve_from_reserve",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "amount",
            type: "core::integer::u256"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "set_asset_config",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "params",
            type: "vesu::data_model::AssetParams"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "set_ltv_config",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "collateral_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "debt_asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "ltv_config",
            type: "vesu::data_model::LTVConfig"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "set_asset_parameter",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          },
          {
            name: "parameter",
            type: "core::felt252"
          },
          {
            name: "value",
            type: "core::integer::u256"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "set_extension",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "extension",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      },
      {
        type: "function",
        name: "claim_fee_shares",
        inputs: [
          {
            name: "pool_id",
            type: "core::felt252"
          },
          {
            name: "asset",
            type: "core::starknet::contract_address::ContractAddress"
          }
        ],
        outputs: [],
        state_mutability: "external"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::CreatePool",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "extension",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "creator",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::ModifyPosition",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "collateral_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "debt_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "collateral_delta",
        type: "alexandria_math::i257::i257",
        kind: "data"
      },
      {
        name: "collateral_shares_delta",
        type: "alexandria_math::i257::i257",
        kind: "data"
      },
      {
        name: "debt_delta",
        type: "alexandria_math::i257::i257",
        kind: "data"
      },
      {
        name: "nominal_debt_delta",
        type: "alexandria_math::i257::i257",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::TransferPosition",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "from_collateral_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "from_debt_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "to_collateral_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "to_debt_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "from_user",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "to_user",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::LiquidatePosition",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "collateral_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "debt_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "liquidator",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "collateral_delta",
        type: "alexandria_math::i257::i257",
        kind: "data"
      },
      {
        name: "collateral_shares_delta",
        type: "alexandria_math::i257::i257",
        kind: "data"
      },
      {
        name: "debt_delta",
        type: "alexandria_math::i257::i257",
        kind: "data"
      },
      {
        name: "nominal_debt_delta",
        type: "alexandria_math::i257::i257",
        kind: "data"
      },
      {
        name: "bad_debt",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::AccrueFees",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "recipient",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "fee_shares",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::UpdateContext",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "collateral_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "debt_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "collateral_asset_config",
        type: "vesu::data_model::AssetConfig",
        kind: "data"
      },
      {
        name: "debt_asset_config",
        type: "vesu::data_model::AssetConfig",
        kind: "data"
      },
      {
        name: "collateral_asset_price",
        type: "vesu::data_model::AssetPrice",
        kind: "data"
      },
      {
        name: "debt_asset_price",
        type: "vesu::data_model::AssetPrice",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::Flashloan",
    kind: "struct",
    members: [
      {
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "receiver",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "amount",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::ModifyDelegation",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "delegator",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "delegatee",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "delegation",
        type: "core::bool",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::Donate",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "amount",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::RetrieveReserve",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "receiver",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::SetLTVConfig",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "collateral_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "debt_asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "ltv_config",
        type: "vesu::data_model::LTVConfig",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::SetAssetConfig",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::SetAssetParameter",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "asset",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      },
      {
        name: "parameter",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "value",
        type: "core::integer::u256",
        kind: "data"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::SetExtension",
    kind: "struct",
    members: [
      {
        name: "pool_id",
        type: "core::felt252",
        kind: "key"
      },
      {
        name: "extension",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key"
      }
    ]
  },
  {
    type: "event",
    name: "vesu::singleton::Singleton::Event",
    kind: "enum",
    variants: [
      {
        name: "CreatePool",
        type: "vesu::singleton::Singleton::CreatePool",
        kind: "nested"
      },
      {
        name: "ModifyPosition",
        type: "vesu::singleton::Singleton::ModifyPosition",
        kind: "nested"
      },
      {
        name: "TransferPosition",
        type: "vesu::singleton::Singleton::TransferPosition",
        kind: "nested"
      },
      {
        name: "LiquidatePosition",
        type: "vesu::singleton::Singleton::LiquidatePosition",
        kind: "nested"
      },
      {
        name: "AccrueFees",
        type: "vesu::singleton::Singleton::AccrueFees",
        kind: "nested"
      },
      {
        name: "UpdateContext",
        type: "vesu::singleton::Singleton::UpdateContext",
        kind: "nested"
      },
      {
        name: "Flashloan",
        type: "vesu::singleton::Singleton::Flashloan",
        kind: "nested"
      },
      {
        name: "ModifyDelegation",
        type: "vesu::singleton::Singleton::ModifyDelegation",
        kind: "nested"
      },
      {
        name: "Donate",
        type: "vesu::singleton::Singleton::Donate",
        kind: "nested"
      },
      {
        name: "RetrieveReserve",
        type: "vesu::singleton::Singleton::RetrieveReserve",
        kind: "nested"
      },
      {
        name: "SetLTVConfig",
        type: "vesu::singleton::Singleton::SetLTVConfig",
        kind: "nested"
      },
      {
        name: "SetAssetConfig",
        type: "vesu::singleton::Singleton::SetAssetConfig",
        kind: "nested"
      },
      {
        name: "SetAssetParameter",
        type: "vesu::singleton::Singleton::SetAssetParameter",
        kind: "nested"
      },
      {
        name: "SetExtension",
        type: "vesu::singleton::Singleton::SetExtension",
        kind: "nested"
      }
    ]
  }
];

// src/services/protocols/vesu.ts
var VESU_CONFIG = {
  mainnet: {
    contracts: {
      vXSTRK: {
        address: "0x037ff012710c5175004687bc4d9e4c6e86d6ce5ca6fb6afee72ea02b1208fdb7",
        deploymentBlock: 954847,
        maxBlock: 1440400
      },
      vXSTRKV2: {
        address: "0x040f67320745980459615f4f3e7dd71002dbe6c68c8249c847c82dbe327b23cb",
        deploymentBlock: 1440456
      },
      vAlterscopeXSTRK: {
        address: "0x062b16a3c933bd60eddc9630c3d088f0a1e9dcd510fbbf4ff3fb3b6a3839fd8a",
        deploymentBlock: 1197971,
        maxBlock: 1440400
      },
      vAlterscopeXSTRKV2: {
        address: "0x020478f0a1b1ef010aa24104ba0e91bf60efcabed02026b75e1d68690809e453",
        deploymentBlock: 1440471
      },
      vRE7rUSDCXSTRK: {
        address: "0x069d2c197680bd60bafe1804239968275a1c85a1cad921809277306634b332b5",
        deploymentBlock: 1240391,
        maxBlock: 1440400
      },
      vRE7rUSDCXSTRKV2: {
        address: "0x0318761ecb936a2905306c371c7935d2a6a0fa24493ac7c87be3859a36e2563a",
        deploymentBlock: 1440481
      }
    },
    singleton: {
      address: "0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef",
      deploymentBlock: 954847,
      maxBlock: 1440400
    },
    singletonV2: {
      address: "0x000d8d6dfec4d33bfb6895de9f3852143a17c6f92fd2a21da3d6924d34870160",
      deploymentBlock: 1440481
    },
    pools: {
      RE7_XSTRK: {
        id: "0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161",
        deploymentBlock: 954847
      },
      ALTERSCOPE_XSTRK: {
        id: "0x27f2bb7fb0e232befc5aa865ee27ef82839d5fad3e6ec1de598d0fab438cb56",
        deploymentBlock: 1197971
      },
      RE7_rUSDC: {
        id: "0x3de03fafe6120a3d21dc77e101de62e165b2cdfe84d12540853bd962b970f99",
        deploymentBlock: 1240391
      }
    },
    tokens: {
      xSTRK: CONTRACTS.mainnet.lst,
      STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
      USDT: "0x068f5c6a617307684de5657061a5b3d3c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c",
      WBTC: "0x03fe2b97c1fd336e750087d68b641b00075fe5c8c8c8c8c8c8c8c8c8c8c8c8c",
      RUSDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8"
    }
  },
  testnet: {
    contracts: {
      vXSTRK: {
        address: "0x037ff012710c5175004687bc4d9e4c6e86d6ce5ca6fb6afee72ea02b1208fdb7",
        deploymentBlock: 954847,
        maxBlock: 1440400
      },
      vXSTRKV2: {
        address: "0x040f67320745980459615f4f3e7dd71002dbe6c68c8249c847c82dbe327b23cb",
        deploymentBlock: 1440456
      },
      vAlterscopeXSTRK: {
        address: "0x062b16a3c933bd60eddc9630c3d088f0a1e9dcd510fbbf4ff3fb3b6a3839fd8a",
        deploymentBlock: 1197971,
        maxBlock: 1440400
      },
      vAlterscopeXSTRKV2: {
        address: "0x020478f0a1b1ef010aa24104ba0e91bf60efcabed02026b75e1d68690809e453",
        deploymentBlock: 1440471
      },
      vRE7rUSDCXSTRK: {
        address: "0x069d2c197680bd60bafe1804239968275a1c85a1cad921809277306634b332b5",
        deploymentBlock: 1240391,
        maxBlock: 1440400
      },
      vRE7rUSDCXSTRKV2: {
        address: "0x0318761ecb936a2905306c371c7935d2a6a0fa24493ac7c87be3859a36e2563a",
        deploymentBlock: 1440481
      }
    },
    singleton: {
      address: "0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef",
      deploymentBlock: 954847,
      maxBlock: 1440400
    },
    singletonV2: {
      address: "0x000d8d6dfec4d33bfb6895de9f3852143a17c6f92fd2a21da3d6924d34870160",
      deploymentBlock: 1440481
    },
    pools: {
      RE7_XSTRK: {
        id: "0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161",
        deploymentBlock: 954847
      },
      ALTERSCOPE_XSTRK: {
        id: "0x27f2bb7fb0e232befc5aa865ee27ef82839d5fad3e6ec1de598d0fab438cb56",
        deploymentBlock: 1197971
      },
      RE7_rUSDC: {
        id: "0x3de03fafe6120a3d21dc77e101de62e165b2cdfe84d12540853bd962b970f99",
        deploymentBlock: 1240391
      }
    },
    tokens: {
      xSTRK: CONTRACTS.testnet.lst,
      STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
      USDT: "0x068f5c6a617307684de5657061a5b3d3c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c",
      WBTC: "0x03fe2b97c1fd336e750087d68b641b00075fe5c8c8c8c8c8c8c8c8c8c8c8c8c",
      RUSDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8"
    }
  }
};
var VesuHoldingsService = class extends BaseHoldingsService {
  constructor(config) {
    super(config);
    this.config = VESU_CONFIG[config.config.network] || VESU_CONFIG.mainnet;
  }
  async getHoldings(request) {
    try {
      this.validateProvider();
      this.validateAddress(request.address);
      const { address, blockNumber } = request;
      const holdings = await this.getVesuHoldings(address, blockNumber);
      return {
        success: true,
        data: holdings,
        protocol: "vesu",
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        protocol: "vesu",
        timestamp: Date.now()
      };
    }
  }
  async getVesuHoldings(address, blockNumber) {
    let xSTRKAmount = BigInt(0);
    let STRKAmount = BigInt(0);
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
      STRKAmount: STRKAmount.toString()
    };
  }
  async getVaultHoldings(address, blockNumber) {
    const vaults = [
      { type: "vXSTRK", config1: this.config.contracts.vXSTRK, config2: this.config.contracts.vXSTRKV2 },
      { type: "vAlterscopeXSTRK", config1: this.config.contracts.vAlterscopeXSTRK, config2: this.config.contracts.vAlterscopeXSTRKV2 },
      { type: "vRE7rUSDCXSTRK", config1: this.config.contracts.vRE7rUSDCXSTRK, config2: this.config.contracts.vRE7rUSDCXSTRKV2 }
    ];
    let totalXSTRK = BigInt(0);
    let totalSTRK = BigInt(0);
    const vaultHoldingsPromises = vaults.map(
      (vault) => this.getVaultHoldingsByType(address, vault.type, vault.config1, vault.config2, blockNumber)
    );
    const vaultHoldingsResults = await Promise.all(vaultHoldingsPromises);
    for (const holdings of vaultHoldingsResults) {
      totalXSTRK += BigInt(holdings.xSTRKAmount);
      totalSTRK += BigInt(holdings.STRKAmount);
    }
    return {
      xSTRKAmount: totalXSTRK.toString(),
      STRKAmount: totalSTRK.toString()
    };
  }
  async getVaultHoldingsByType(address, vaultType, vaultConfig1, vaultConfig2, blockNumber) {
    try {
      const isV1Deployed = this.isContractDeployed(blockNumber, vaultConfig1.deploymentBlock, vaultConfig1.maxBlock);
      const isV2Deployed = this.isContractDeployed(blockNumber, vaultConfig2.deploymentBlock);
      if (!isV1Deployed && !isV2Deployed) {
        return this.createZeroHoldings();
      }
      const vTokens = isV2Deployed ? [vaultConfig1.address, vaultConfig2.address] : [vaultConfig1.address];
      let totalBalance = BigInt(0);
      for (const token of vTokens) {
        const contract = new Contract(erc4626_abi_default, token, this.provider);
        const shares = await contract.call("balance_of", [address], {
          blockIdentifier: blockNumber ?? "pending"
        });
        const assetsToken = isV2Deployed ? vaultConfig2.address : vaultConfig1.address;
        const contractV2 = new Contract(erc4626_abi_default, assetsToken, this.provider);
        const balance = await contractV2.call("convert_to_assets", [shares], {
          blockIdentifier: blockNumber ?? "pending"
        });
        totalBalance += BigInt(balance.toString());
      }
      return {
        xSTRKAmount: totalBalance.toString(),
        STRKAmount: "0"
      };
    } catch (error) {
      console.error(`Vesu::getVaultHoldingsByType::error`, error);
      return this.createZeroHoldings();
    }
  }
  async getCollateralHoldings(address, blockNumber) {
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
    const singletonAddress = isV2SingletonDeployed ? this.config.singletonV2.address : this.config.singleton.address;
    let totalXSTRK = BigInt(0);
    const pools = [
      { id: this.config.pools.RE7_XSTRK.id, debtToken: this.config.tokens.STRK, deploymentBlock: this.config.pools.RE7_XSTRK.deploymentBlock },
      { id: this.config.pools.RE7_rUSDC.id, debtToken: this.config.tokens.RUSDC, deploymentBlock: this.config.pools.RE7_rUSDC.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.WBTC, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.ETH, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.USDC, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.USDT, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock },
      { id: this.config.pools.ALTERSCOPE_XSTRK.id, debtToken: this.config.tokens.STRK, deploymentBlock: this.config.pools.ALTERSCOPE_XSTRK.deploymentBlock }
    ];
    for (const pool of pools) {
      if (!this.isContractDeployed(blockNumber, pool.deploymentBlock)) {
        continue;
      }
      try {
        const contract = new Contract(vesu_singleton_abi_default, singletonAddress, this.provider);
        const position = await contract.call("position_unsafe", [
          pool.id,
          this.config.tokens.xSTRK,
          pool.debtToken,
          address
        ], {
          blockIdentifier: blockNumber ?? "pending"
        });
        totalXSTRK += BigInt(position[1].toString());
      } catch (error) {
        if (error.message.includes("unknown-pool")) {
          continue;
        }
        console.error("Error fetching Vesu collateral:", error);
      }
    }
    return {
      xSTRKAmount: totalXSTRK.toString(),
      STRKAmount: "0"
    };
  }
};

// src/services/holdings-manager.ts
var HoldingsManager = class {
  constructor(config) {
    this.network = config.config.network;
    this.provider = config.provider;
    this.sdkConfig = config;
    this.services = /* @__PURE__ */ new Map();
    this.services.set("lst", new LSTHoldingsService(config));
    this.services.set("ekubo", new EkuboHoldingsService(config));
    this.services.set("nostraLending", new NostraLendingHoldingsService(config));
    this.services.set("nostraDex", new NostraDexHoldingsService(config));
    this.services.set("opus", new OpusHoldingsService(config));
    this.services.set("strkfarm", new STRKFarmSenseiHoldingsService(config));
    this.services.set("strkfarmEkubo", new STRKFarmEkuboHoldingsService(config));
    this.services.set("vesu", new VesuHoldingsService(config));
  }
  /**
   * Sets the provider for all services
   */
  setProvider(provider) {
    this.provider = provider;
    this.services.forEach((service) => {
      service.setProvider(provider);
    });
  }
  /**
   * Gets holdings for a specific protocol
   */
  async getProtocolHoldings(protocol, request) {
    const service = this.services.get(protocol);
    if (!service) {
      return {
        success: false,
        error: `Protocol ${protocol} not supported`,
        protocol,
        timestamp: Date.now()
      };
    }
    return service.getHoldings(request);
  }
  /**
   * Gets holdings for multiple protocols
   */
  async getMultiProtocolHoldings(request, protocols = ["lst", "ekubo", "nostraLending", "nostraDex", "opus", "strkfarm", "strkfarmEkubo", "vesu"]) {
    const byProtocol = {
      lst: { xSTRKAmount: "0", STRKAmount: "0" },
      ekubo: { xSTRKAmount: "0", STRKAmount: "0" },
      nostraLending: { xSTRKAmount: "0", STRKAmount: "0" },
      nostraDex: { xSTRKAmount: "0", STRKAmount: "0" },
      opus: { xSTRKAmount: "0", STRKAmount: "0" },
      strkfarm: { xSTRKAmount: "0", STRKAmount: "0" },
      strkfarmEkubo: { xSTRKAmount: "0", STRKAmount: "0" },
      vesu: { xSTRKAmount: "0", STRKAmount: "0" }
    };
    let total = { xSTRKAmount: "0", STRKAmount: "0" };
    const promises = protocols.map(async (protocol) => {
      try {
        const response = await this.getProtocolHoldings(protocol, request);
        if (response.success && response.data) {
          byProtocol[protocol] = response.data;
          total.xSTRKAmount = (BigInt(total.xSTRKAmount) + BigInt(response.data.xSTRKAmount)).toString();
          total.STRKAmount = (BigInt(total.STRKAmount) + BigInt(response.data.STRKAmount)).toString();
        } else {
          byProtocol[protocol] = { xSTRKAmount: "0", STRKAmount: "0" };
        }
      } catch (error) {
        console.error(`Error fetching holdings for ${protocol}:`, error);
        byProtocol[protocol] = { xSTRKAmount: "0", STRKAmount: "0" };
      }
    });
    await Promise.all(promises);
    return {
      total,
      byProtocol,
      protocols
    };
  }
  /**
   * Gets all available protocols
   */
  getAvailableProtocols() {
    return [
      {
        type: "lst",
        name: "LST",
        description: "Liquid Staking Token protocol",
        isActive: true,
        supportedNetworks: ["mainnet", "testnet"]
      },
      {
        type: "ekubo",
        name: "Ekubo",
        description: "Concentrated liquidity AMM",
        isActive: true,
        supportedNetworks: ["mainnet", "testnet"]
      },
      {
        type: "nostraLending",
        name: "Nostra Lending",
        description: "Lending and borrowing protocol",
        isActive: true,
        supportedNetworks: ["mainnet", "testnet"]
      },
      {
        type: "nostraDex",
        name: "Nostra Dex",
        description: "Dex protocol",
        isActive: true,
        supportedNetworks: ["mainnet", "testnet"]
      },
      {
        type: "opus",
        name: "Opus",
        description: "CDP and lending protocol",
        isActive: true,
        supportedNetworks: ["mainnet", "testnet"]
      },
      {
        type: "strkfarm",
        name: "STRKFarm",
        description: "Yield farming protocol",
        isActive: true,
        supportedNetworks: ["mainnet", "testnet"]
      },
      {
        type: "vesu",
        name: "Vesu",
        description: "DeFi protocol with vaults and collateral",
        isActive: true,
        supportedNetworks: ["mainnet", "testnet"]
      }
    ];
  }
  /**
   * Gets a specific protocol service
   */
  getProtocolService(protocol) {
    return this.services.get(protocol);
  }
  /**
   * Updates network for all services
   */
  updateNetwork(network) {
    this.network = network;
    this.services.clear();
    this.services.set("lst", new LSTHoldingsService(this.sdkConfig));
    this.services.set("ekubo", new EkuboHoldingsService(this.sdkConfig));
    this.services.set("nostraLending", new NostraLendingHoldingsService(this.sdkConfig));
    this.services.set("nostraDex", new NostraDexHoldingsService(this.sdkConfig));
    this.services.set("opus", new OpusHoldingsService(this.sdkConfig));
    this.services.set("strkfarm", new STRKFarmSenseiHoldingsService(this.sdkConfig));
    this.services.set("strkfarmEkubo", new STRKFarmEkuboHoldingsService(this.sdkConfig));
    this.services.set("vesu", new VesuHoldingsService(this.sdkConfig));
    if (this.provider) {
      this.setProvider(this.provider);
    }
  }
  /**
   * Gets the current network
   */
  getNetwork() {
    return this.network;
  }
};

// src/sdk.ts
var EndurSDK = class {
  constructor(options) {
    this.config = {
      timeout: DEFAULT_TIMEOUT,
      network: options.config.network
    };
    this.api = new ApiService(this.config.network, this.config.timeout);
    this.starknet = new StarknetService(
      options.provider,
      options.account,
      this.config.network
    );
    this.lst = new LSTService(this.starknet, this.config.network);
    this.holdings = new HoldingsManager(options);
  }
  /**
   * Gets the current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Updates the configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.network && newConfig.network !== this.config.network) {
      this.api = new ApiService(this.config.network, this.config.timeout);
      this.starknet = new StarknetService(
        this.starknet["provider"],
        this.starknet["account"],
        this.config.network
      );
      this.lst = new LSTService(this.starknet, this.config.network);
      this.holdings.updateNetwork(this.config.network);
    }
  }
  /**
   * Sets the Starknet provider
   */
  setProvider(provider) {
    this.starknet.setProvider(provider);
    this.holdings.setProvider(provider);
  }
  /**
   * Sets the Starknet account
   */
  setAccount(account) {
    this.starknet.setAccount(account);
  }
  /**
   * Gets the current network
   */
  getNetwork() {
    return this.config.network || DEFAULT_NETWORK;
  }
  /**
   * Checks if the SDK is properly configured
   */
  isConfigured() {
    return !!this.config.network;
  }
  /**
   * Gets SDK version
   */
  getVersion() {
    return "1.0.0";
  }
};

export { API_ENDPOINTS, API_ROUTES, ApiService, BaseHoldingsService, CONTRACTS, CONTRACT_NAMES, DEFAULT_API_TIMEOUT, DEFAULT_NETWORK, DEFAULT_TIMEOUT, EkuboHoldingsService, EndurSDK, HoldingsManager, LSTHoldingsService, LSTService, MAX_RETRIES, NETWORKS, NostraDexHoldingsService, NostraLendingHoldingsService, OpusHoldingsService, RETRY_DELAY, STRKFarmEkuboHoldingsService, STRKFarmSenseiHoldingsService, StarknetService, VesuHoldingsService, calculatePercentage, clamp, formatAddress, formatDuration, formatLargeNumber, formatNumber, formatPercentage, formatTimestamp, formatTransactionHash, fromWei, generateRandomHex, hexToNumber, hexToString, isHexString, isInRange, isValidArray, isValidBoolean, isValidHexString, isValidNumber, isValidObject, isValidStarknetAddress, isValidString, numberToHex, padHex, roundToDecimals, safeAdd, safeDivide, safeMultiply, safeSubtract, stringToHex, toWei };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map
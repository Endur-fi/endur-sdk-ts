import { RpcProvider, Account, BlockIdentifier } from 'starknet';

type Network = 'mainnet' | 'testnet';
interface SDKConfig {
    network: Network;
    apiUrl?: string;
    timeout?: number;
}
interface SDKOptions {
    config: SDKConfig;
    provider: RpcProvider;
    account?: Account;
}
interface NetworkConfig {
    name: string;
    chainId: string;
    rpcUrl: string;
    explorerUrl: string;
}
interface ErrorResponse {
    code: string;
    message: string;
    details?: any;
}
interface SuccessResponse<T = any> {
    success: true;
    data: T;
}
interface ApiResponse<T = any> extends SuccessResponse<T> {
    timestamp: number;
    requestId?: string;
}
type Result<T, E = ErrorResponse> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};

interface UserInfo {
    address: string;
    points: number;
    rank?: number;
    totalStaked?: string;
    rewards?: string;
}
interface LeaderboardEntry {
    rank: number;
    address: string;
    points: number;
    totalStaked: string;
    rewards: string;
}
interface PortfolioData {
    totalValue: string;
    stakedAmount: string;
    rewards: string;
    positions: Position[];
}
interface Position {
    id: string;
    type: 'lst' | 'lp' | 'other';
    amount: string;
    value: string;
    apy?: number;
}
interface PointsData {
    total: number;
    staking: number;
    trading: number;
    referral: number;
    bonus: number;
}
interface AllocationData {
    address: string;
    amount: string;
    proof: string[];
    root: string;
}

interface ContractAddress {
    address: string;
    classHash?: string;
}
interface TransactionOptions {
    maxFee?: string;
    nonce?: number;
    version?: number;
}
interface CallData {
    contractAddress: string;
    entrypoint: string;
    calldata: string[];
}
interface TransactionResult {
    transactionHash: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    blockNumber?: number;
    blockHash?: string;
}
interface EventFilter {
    fromBlock?: number;
    toBlock?: number;
    address?: string;
    keys?: string[];
}
interface Event {
    transactionHash: string;
    blockNumber: number;
    blockHash: string;
    address: string;
    keys: string[];
    data: string[];
}
interface BlockInfo {
    blockNumber: number;
    blockHash: string;
    timestamp: number;
    parentHash: string;
    sequencerAddress: string;
}

interface ProtocolHoldings {
    xSTRKAmount: string;
    STRKAmount: string;
}
interface ProtocolConfig {
    name: string;
    contractAddress: string;
    deploymentBlock: number;
    maxBlock?: number;
    abi: any;
}
interface ProtocolPosition {
    id: string;
    type: 'lst' | 'lp' | 'vault' | 'farm' | 'trove';
    amount: string;
    value: string;
    apy?: number;
    metadata?: Record<string, any>;
}
interface ProtocolMetadata {
    totalSupply?: string;
    totalAssets?: string;
    exchangeRate?: string;
    apy?: number;
    fees?: string;
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
type ProtocolType = 'lst' | 'ekubo' | 'nostraLending' | 'nostraDex' | 'opus' | 'strkfarm' | 'strkfarmEkubo' | 'vesu';
interface ProtocolInfo {
    type: ProtocolType;
    name: string;
    description: string;
    isActive: boolean;
    supportedNetworks: string[];
}

declare function isValidStarknetAddress(address: string): boolean;
declare function isValidHexString(hex: string): boolean;
declare function isValidNumber(value: any): boolean;
declare function isValidString(value: any): boolean;
declare function isValidBoolean(value: any): boolean;
declare function isValidObject(value: any): boolean;
declare function isValidArray(value: any): boolean;

declare function formatNumber(value: number, decimals?: number): string;
declare function formatPercentage(value: number, decimals?: number): string;
declare function formatLargeNumber(value: number): string;
declare function formatAddress(address: string): string;
declare function formatTransactionHash(hash: string): string;
declare function formatTimestamp(timestamp: number): string;
declare function formatDuration(seconds: number): string;

declare function toWei(amount: number, decimals?: number): string;
declare function fromWei(amount: string, decimals?: number): number;
declare function safeAdd(a: number, b: number): number;
declare function safeSubtract(a: number, b: number): number;
declare function safeMultiply(a: number, b: number): number;
declare function safeDivide(a: number, b: number): number;
declare function calculatePercentage(part: number, total: number): number;
declare function roundToDecimals(value: number, decimals?: number): number;
declare function clamp(value: number, min: number, max: number): number;
declare function isInRange(value: number, min: number, max: number): boolean;

declare function generateRandomHex(length?: number): string;
declare function stringToHex(str: string): string;
declare function hexToString(hex: string): string;
declare function numberToHex(num: number): string;
declare function hexToNumber(hex: string): number;
declare function padHex(hex: string, length: number): string;
declare function isHexString(str: string): boolean;

declare class ApiService {
    private client;
    private network;
    constructor(network?: string, timeout?: number);
    private get;
    private post;
    private handleApiError;
    getUserInfo(address: string): Promise<Result<UserInfo>>;
    getLeaderboard(limit?: number): Promise<Result<LeaderboardEntry[]>>;
    getPortfolio(address: string): Promise<Result<PortfolioData>>;
    getPoints(address: string): Promise<Result<PointsData>>;
    getAllocation(address: string): Promise<Result<AllocationData>>;
    getStatus(): Promise<Result<{
        status: string;
        timestamp: number;
    }>>;
}

declare class StarknetService {
    private provider;
    private account;
    private network;
    constructor(provider?: any, account?: any, network?: string);
    setProvider(provider: RpcProvider): void;
    setAccount(account: Account): void;
    getNetwork(): string;
    callContract(callData: CallData): Promise<any>;
    executeTransaction(calls: CallData[], options?: TransactionOptions): Promise<TransactionResult>;
    getTransactionStatus(transactionHash: string): Promise<TransactionResult>;
    getEvents(filter: EventFilter): Promise<Event[]>;
    getBlockInfo(blockNumber?: number): Promise<BlockInfo>;
    getBlockNumber(): Promise<number>;
    getBalance(address: string, tokenAddress?: string): Promise<string>;
}

declare class LSTService {
    private starknetService;
    private network;
    constructor(starknetService: any, network?: string);
    private getLSTAddress;
    private getWithdrawalQueueAddress;
    deposit(amount: string, options?: TransactionOptions): Promise<TransactionResult>;
    depositWithReferral(amount: string, referralCode: string, options?: TransactionOptions): Promise<TransactionResult>;
    mint(amount: string, options?: TransactionOptions): Promise<TransactionResult>;
    redeem(amount: string, options?: TransactionOptions): Promise<TransactionResult>;
    getExchangeRate(): Promise<string>;
    getTotalSupply(): Promise<string>;
    getBalance(address: string): Promise<string>;
    stake(amount: string, delegatorAddress: string, options?: TransactionOptions): Promise<TransactionResult>;
    unstake(amount: string, delegatorAddress: string, options?: TransactionOptions): Promise<TransactionResult>;
    requestWithdrawal(amount: string, options?: TransactionOptions): Promise<TransactionResult>;
    claimWithdrawal(requestId: string, options?: TransactionOptions): Promise<TransactionResult>;
}

declare abstract class BaseHoldingsService {
    protected provider: RpcProvider;
    protected sdkConfig: SDKOptions;
    constructor(config: SDKOptions);
    setProvider(provider: RpcProvider): void;
    protected isContractDeployed(blockNumber: BlockIdentifier | undefined, deploymentBlock: number, maxBlock?: number): boolean;
    protected createZeroHoldings(): ProtocolHoldings;
    protected validateAddress(address: string): void;
    protected validateProvider(): void;
    protected addHoldings(a: ProtocolHoldings, b: ProtocolHoldings): ProtocolHoldings;
    protected multiplyHoldings(holdings: ProtocolHoldings, factor: string): ProtocolHoldings;
    abstract getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;
    getMultiProtocolHoldings(request: HoldingsRequest, protocols: string[]): Promise<MultiProtocolHoldings>;
}

declare class HoldingsManager {
    private services;
    private network;
    private provider;
    private sdkConfig;
    constructor(config: SDKOptions);
    setProvider(provider: any): void;
    getProtocolHoldings(protocol: ProtocolType, request: HoldingsRequest): Promise<HoldingsResponse>;
    getMultiProtocolHoldings(request: HoldingsRequest, protocols?: ProtocolType[]): Promise<MultiProtocolHoldings>;
    getAvailableProtocols(): ProtocolInfo[];
    getProtocolService(protocol: ProtocolType): any;
    updateNetwork(network: string): void;
    getNetwork(): string;
}

declare class LSTHoldingsService extends BaseHoldingsService {
    private config;
    constructor(config: SDKOptions);
    getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;
    private getXSTRKHoldings;
    getTotalAssets(blockNumber?: BlockIdentifier): Promise<string>;
    getTotalSupply(blockNumber?: BlockIdentifier): Promise<string>;
    getExchangeRate(blockNumber?: BlockIdentifier): Promise<string>;
    convertXSTRKToSTRK(xSTRKAmount: string, blockNumber?: BlockIdentifier): Promise<string>;
}

declare class EkuboHoldingsService extends BaseHoldingsService {
    private config;
    private apolloClient;
    constructor(config: SDKOptions);
    getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;
    private getEkuboHoldings;
}

declare const NOSTRA_CONFIG: {
    mainnet: {
        contracts: {
            nXSTRK: {
                address: string;
                deploymentBlock: number;
            };
            nXSTRKC: {
                address: string;
                deploymentBlock: number;
            };
            iXSTRK: {
                address: string;
                deploymentBlock: number;
            };
            iXSTRKC: {
                address: string;
                deploymentBlock: number;
            };
            dXSTRK: {
                address: string;
                deploymentBlock: number;
            };
        };
    };
    testnet: {
        contracts: {
            nXSTRK: {
                address: string;
                deploymentBlock: number;
            };
            nXSTRKC: {
                address: string;
                deploymentBlock: number;
            };
            iXSTRK: {
                address: string;
                deploymentBlock: number;
            };
            iXSTRKC: {
                address: string;
                deploymentBlock: number;
            };
            dXSTRK: {
                address: string;
                deploymentBlock: number;
            };
        };
    };
};
declare class NostraLendingHoldingsService extends BaseHoldingsService {
    private config;
    constructor(config: SDKOptions);
    getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;
    private getNostraHoldings;
    private getVaultHoldings;
    getVaultHoldingsByType(address: string, vaultType: keyof typeof NOSTRA_CONFIG.mainnet.contracts, blockNumber?: BlockIdentifier): Promise<ProtocolHoldings>;
}

declare class NostraDexHoldingsService extends BaseHoldingsService {
    private config;
    constructor(config: SDKOptions);
    getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;
    private getNostraHoldings;
    private getLPHoldings;
}

declare class OpusHoldingsService extends BaseHoldingsService {
    private config;
    constructor(config: SDKOptions);
    getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;
    private getOpusHoldings;
    getUserTroves(address: string, blockNumber?: BlockIdentifier): Promise<string[]>;
    getTroveAssetBalance(troveId: string, assetAddress: string, blockNumber?: BlockIdentifier): Promise<string>;
}

declare class STRKFarmSenseiHoldingsService extends BaseHoldingsService {
    private config;
    constructor(config: SDKOptions);
    getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;
    private getSTRKFarmHoldings;
    private getSenseiHoldings;
}
declare class STRKFarmEkuboHoldingsService extends BaseHoldingsService {
    private config;
    constructor(config: SDKOptions);
    getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;
    private getSTRKFarmHoldings;
    private getEkuboSTRKFarmHoldings;
}

declare class VesuHoldingsService extends BaseHoldingsService {
    private config;
    constructor(config: SDKOptions);
    getHoldings(request: HoldingsRequest): Promise<HoldingsResponse>;
    private getVesuHoldings;
    private getVaultHoldings;
    private getVaultHoldingsByType;
    private getCollateralHoldings;
}

declare const NETWORKS: Record<string, NetworkConfig>;
declare const DEFAULT_NETWORK = "mainnet";
declare const DEFAULT_TIMEOUT = 30000;

declare const CONTRACTS: Record<Network, {
    lst: string;
    withdrawalQueue: string;
    strk: string;
}>;
declare const CONTRACT_NAMES: {
    readonly LST: "lst";
    readonly DELEGATOR: "delegator";
    readonly WITHDRAWAL_QUEUE: "withdrawalQueue";
    readonly STRK: "strk";
};

declare const API_ENDPOINTS: {
    readonly mainnet: {
        readonly base: "https://api.endur.fi";
        readonly graphql: "https://api.endur.fi/graphql";
    };
    readonly testnet: {
        readonly base: "https://api-testnet.endur.fi";
        readonly graphql: "https://api-testnet.endur.fi/graphql";
    };
    readonly devnet: {
        readonly base: "http://localhost:3000";
        readonly graphql: "http://localhost:3000/graphql";
    };
};
declare const API_ROUTES: {
    readonly USER_INFO: "/user";
    readonly LEADERBOARD: "/leaderboard";
    readonly PORTFOLIO: "/portfolio";
    readonly POINTS: "/points";
    readonly ALLOCATION: "/allocation";
    readonly STATUS: "/status";
};
declare const DEFAULT_API_TIMEOUT = 10000;
declare const MAX_RETRIES = 3;
declare const RETRY_DELAY = 1000;

declare class EndurSDK {
    api: ApiService;
    starknet: StarknetService;
    lst: LSTService;
    holdings: HoldingsManager;
    private config;
    constructor(options: SDKOptions);
    getConfig(): SDKConfig;
    updateConfig(newConfig: Partial<SDKConfig>): void;
    setProvider(provider: RpcProvider): void;
    setAccount(account: Account): void;
    getNetwork(): string;
    isConfigured(): boolean;
    getVersion(): string;
}

export { API_ENDPOINTS, API_ROUTES, type AllocationData, type ApiResponse, ApiService, BaseHoldingsService, type BlockInfo, CONTRACTS, CONTRACT_NAMES, type CallData, type ContractAddress, DEFAULT_API_TIMEOUT, DEFAULT_NETWORK, DEFAULT_TIMEOUT, EkuboHoldingsService, EndurSDK, type ErrorResponse, type Event, type EventFilter, HoldingsManager, type HoldingsRequest, type HoldingsResponse, LSTHoldingsService, LSTService, type LeaderboardEntry, MAX_RETRIES, type MultiProtocolHoldings, NETWORKS, type Network, type NetworkConfig, NostraDexHoldingsService, NostraLendingHoldingsService, OpusHoldingsService, type PointsData, type PortfolioData, type Position, type ProtocolConfig, type ProtocolHoldings, type ProtocolInfo, type ProtocolMetadata, type ProtocolPosition, type ProtocolType, RETRY_DELAY, type Result, type SDKConfig, type SDKOptions, STRKFarmEkuboHoldingsService, STRKFarmSenseiHoldingsService, StarknetService, type SuccessResponse, type TransactionOptions, type TransactionResult, type UserInfo, VesuHoldingsService, calculatePercentage, clamp, formatAddress, formatDuration, formatLargeNumber, formatNumber, formatPercentage, formatTimestamp, formatTransactionHash, fromWei, generateRandomHex, hexToNumber, hexToString, isHexString, isInRange, isValidArray, isValidBoolean, isValidHexString, isValidNumber, isValidObject, isValidStarknetAddress, isValidString, numberToHex, padHex, roundToDecimals, safeAdd, safeDivide, safeMultiply, safeSubtract, stringToHex, toWei };

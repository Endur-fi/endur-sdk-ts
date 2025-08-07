// API types

export interface UserInfo {
  address: string;
  points: number;
  rank?: number;
  totalStaked?: string;
  rewards?: string;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  points: number;
  totalStaked: string;
  rewards: string;
}

export interface PortfolioData {
  totalValue: string;
  stakedAmount: string;
  rewards: string;
  positions: Position[];
}

export interface Position {
  id: string;
  type: 'lst' | 'lp' | 'other';
  amount: string;
  value: string;
  apy?: number;
}

export interface PointsData {
  total: number;
  staking: number;
  trading: number;
  referral: number;
  bonus: number;
}

export interface AllocationData {
  address: string;
  amount: string;
  proof: string[];
  root: string;
} 
// API service
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  ErrorResponse, 
  Result, 
  UserInfo, 
  LeaderboardEntry, 
  PortfolioData, 
  PointsData, 
  AllocationData 
} from '../types';
import { API_ENDPOINTS, API_ROUTES, DEFAULT_API_TIMEOUT, MAX_RETRIES, RETRY_DELAY } from '../constants';

export class ApiService {
  private client: AxiosInstance;
  private network: string;

  constructor(network: string = 'mainnet', timeout: number = DEFAULT_API_TIMEOUT) {
    this.network = network;
    this.client = axios.create({
      baseURL: API_ENDPOINTS[network as keyof typeof API_ENDPOINTS]?.base,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any request logging or modification here
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
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
  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error as ErrorResponse };
    }
  }

  /**
   * Makes a POST request to the API
   */
  private async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error as ErrorResponse };
    }
  }

  /**
   * Handles API errors
   */
  private handleApiError(error: any): ErrorResponse {
    if (error.response) {
      return {
        code: error.response.status.toString(),
        message: error.response.data?.message || 'API request failed',
        details: error.response.data,
      };
    }
    
    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error - no response received',
        details: error.request,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      details: error,
    };
  }

  /**
   * Gets user information
   */
  async getUserInfo(address: string): Promise<Result<UserInfo>> {
    return this.get<UserInfo>(`${API_ROUTES.USER_INFO}/${address}`);
  }

  /**
   * Gets leaderboard data
   */
  async getLeaderboard(limit: number = 100): Promise<Result<LeaderboardEntry[]>> {
    return this.get<LeaderboardEntry[]>(`${API_ROUTES.LEADERBOARD}?limit=${limit}`);
  }

  /**
   * Gets portfolio data for a user
   */
  async getPortfolio(address: string): Promise<Result<PortfolioData>> {
    return this.get<PortfolioData>(`${API_ROUTES.PORTFOLIO}/${address}`);
  }

  /**
   * Gets points data for a user
   */
  async getPoints(address: string): Promise<Result<PointsData>> {
    return this.get<PointsData>(`${API_ROUTES.POINTS}/${address}`);
  }

  /**
   * Gets allocation data for a user
   */
  async getAllocation(address: string): Promise<Result<AllocationData>> {
    return this.get<AllocationData>(`${API_ROUTES.ALLOCATION}/${address}`);
  }

  /**
   * Gets API status
   */
  async getStatus(): Promise<Result<{ status: string; timestamp: number }>> {
    return this.get<{ status: string; timestamp: number }>(API_ROUTES.STATUS);
  }
} 
import axios from 'axios';

const API_BASE_URL = '/api';

export interface PointBalance {
  starPoints: string;
  pointsEarnedFromMinting: string;
  pointsEarnedFromPlatform: string;
  pointsEarnedFromReferrals: string;
  pointsEarnedFromTasks: string;
  initialBonusReceived: boolean;
}

export interface MintStats {
  totalSupply: string;
  pointHoldersAllocationPercent: string;
  totalXlmReceived: string;
  totalStarMinted: string;
  mintingActive: boolean;
  totalUsers: number;
  usersWithInitialBonus: number;
  totalStarDistributed: string;
}

export interface ReferralInfo {
  referralCode: string;
  referralUrl: string;
  totalReferrals: number;
  successfulReferrals: number;
}

export interface Task {
  id: string;
  taskType: string;
  title: string;
  description: string;
  starReward: string;
  isActive: boolean;
  maxCompletions: number | null;
}

export const pointsApi = {
  async mintPoints(walletAddress: string, xlmAmount: number, transactionHash: string) {
    const response = await axios.post(`${API_BASE_URL}/points/mint`, {
      walletAddress,
      xlmAmount,
      transactionHash,
    });
    return response.data;
  },

  async claimBonus(walletAddress: string) {
    const response = await axios.post(`${API_BASE_URL}/points/claim-bonus`, {
      walletAddress,
    });
    return response.data;
  },

  async getBalance(walletAddress: string): Promise<PointBalance> {
    const response = await axios.get(`${API_BASE_URL}/points/balance/${walletAddress}`);
    return response.data;
  },

  async getStats(): Promise<MintStats> {
    const response = await axios.get(`${API_BASE_URL}/points/stats`);
    return response.data;
  },

  async getReferralInfo(walletAddress: string): Promise<ReferralInfo> {
    const response = await axios.get(`${API_BASE_URL}/points/referral/${walletAddress}`);
    return response.data;
  },

  async claimReferral(referralCode: string, walletAddress: string) {
    const response = await axios.post(`${API_BASE_URL}/points/referral/claim`, {
      referralCode,
      walletAddress,
    });
    return response.data;
  },

  async getTasks(): Promise<Task[]> {
    const response = await axios.get(`${API_BASE_URL}/points/tasks`);
    return response.data;
  },

  async getCompletedTasks(walletAddress: string) {
    const response = await axios.get(`${API_BASE_URL}/points/tasks/completed/${walletAddress}`);
    return response.data;
  },

  async completeTask(walletAddress: string, taskId: string, proofData?: any) {
    const response = await axios.post(`${API_BASE_URL}/points/tasks/complete`, {
      walletAddress,
      taskId,
      proofData,
    });
    return response.data;
  },
};

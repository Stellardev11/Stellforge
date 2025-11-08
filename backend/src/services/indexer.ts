import { Server } from '@stellar/stellar-sdk/lib/horizon';

interface Campaign {
  campaignId: string;
  creator: string;
  token: string;
  type: 'public' | 'verified';
  totalAirdrop: string;
  claimedAmount: string;
  startTime: number;
  endTime: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface UserClaim {
  campaignId: string;
  user: string;
  amount: string;
  timestamp: number;
}

export class HorizonIndexer {
  private server: Server;
  private campaigns: Map<string, Campaign> = new Map();
  private claims: UserClaim[] = [];

  constructor(horizonUrl: string) {
    this.server = new Server(horizonUrl);
  }

  async startListening() {
    console.log('Indexer started - listening for Stellar events');
    
    this.server
      .transactions()
      .cursor('now')
      .stream({
        onmessage: (tx: any) => {
          this.processTx(tx);
        },
        onerror: (err: Error) => {
          console.error('Stream error:', err);
        },
      });
  }

  private processTx(tx: any) {
    console.log('Processing tx:', tx.id);
  }

  getCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  getCampaign(id: string): Campaign | undefined {
    return this.campaigns.get(id);
  }

  getClaims(campaignId?: string): UserClaim[] {
    if (campaignId) {
      return this.claims.filter(c => c.campaignId === campaignId);
    }
    return this.claims;
  }

  getLeaderboard(campaignId: string): any[] {
    const campaignClaims = this.getClaims(campaignId);
    const userTotals = new Map<string, number>();

    campaignClaims.forEach(claim => {
      const current = userTotals.get(claim.user) || 0;
      userTotals.set(claim.user, current + parseFloat(claim.amount));
    });

    return Array.from(userTotals.entries())
      .map(([user, total]) => ({ user, total }))
      .sort((a, b) => b.total - a.total);
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorizonIndexer = void 0;
const horizon_1 = require("@stellar/stellar-sdk/lib/horizon");
class HorizonIndexer {
    constructor(horizonUrl) {
        this.campaigns = new Map();
        this.claims = [];
        this.server = new horizon_1.Server(horizonUrl);
    }
    async startListening() {
        console.log('Indexer started - listening for Stellar events');
        this.server
            .transactions()
            .cursor('now')
            .stream({
            onmessage: (tx) => {
                this.processTx(tx);
            },
            onerror: (err) => {
                console.error('Stream error:', err);
            },
        });
    }
    processTx(tx) {
        console.log('Processing tx:', tx.id);
    }
    getCampaigns() {
        return Array.from(this.campaigns.values());
    }
    getCampaign(id) {
        return this.campaigns.get(id);
    }
    getClaims(campaignId) {
        if (campaignId) {
            return this.claims.filter(c => c.campaignId === campaignId);
        }
        return this.claims;
    }
    getLeaderboard(campaignId) {
        const campaignClaims = this.getClaims(campaignId);
        const userTotals = new Map();
        campaignClaims.forEach(claim => {
            const current = userTotals.get(claim.user) || 0;
            userTotals.set(claim.user, current + parseFloat(claim.amount));
        });
        return Array.from(userTotals.entries())
            .map(([user, total]) => ({ user, total }))
            .sort((a, b) => b.total - a.total);
    }
}
exports.HorizonIndexer = HorizonIndexer;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/campaigns', async (req, res) => {
    try {
        const campaigns = [
            {
                id: '1',
                creator: 'GXXX...',
                token: 'MOON',
                type: 'public',
                totalAirdrop: '1000000',
                claimed: '250000',
                participants: 42,
                status: 'active',
                endTime: Date.now() + 86400000 * 7,
            }
        ];
        res.json({ campaigns });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/campaigns/:id', async (req, res) => {
    try {
        const campaign = {
            id: req.params.id,
            creator: 'GXXX...',
            token: 'MOON',
            totalAirdrop: '1000000',
            claimedAmount: '250000',
            tasks: [
                { id: 1, type: 'trustline', description: 'Create trustline', reward: '100', required: true },
                { id: 2, type: 'social', description: 'Follow on Twitter', reward: '50', required: false },
            ],
            stats: {
                participants: 42,
                totalClaimed: '250000',
                avgClaim: '5952',
            }
        };
        res.json(campaign);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/campaigns/:id/leaderboard', async (req, res) => {
    try {
        const leaderboard = [
            { rank: 1, user: 'GABC...', claimed: '15000', referrals: 5 },
            { rank: 2, user: 'GDEF...', claimed: '12000', referrals: 3 },
            { rank: 3, user: 'GHIJ...', claimed: '10000', referrals: 2 },
        ];
        res.json({ leaderboard });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/creator/:address/analytics', async (req, res) => {
    try {
        const analytics = {
            totalCampaigns: 3,
            totalParticipants: 156,
            totalDistributed: '500000',
            activeCampaigns: 1,
            completedCampaigns: 2,
        };
        res.json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;

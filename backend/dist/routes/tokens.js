"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenService_1 = require("../services/tokenService");
const router = express_1.default.Router();
router.post('/create', async (req, res, next) => {
    try {
        const { name, symbol, decimals, totalSupply, description, logoFile, allocation, initialLiquidityXLM, eventDurationDays, vestingEnabled, vestingMonths, distributorPublicKey } = req.body;
        if (!name || !symbol || !totalSupply || !description || !distributorPublicKey) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        if (!allocation || typeof allocation.airdrop !== 'number' || typeof allocation.liquidity !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Invalid allocation settings'
            });
        }
        if (allocation.airdrop < 0 || allocation.liquidity < 0) {
            return res.status(400).json({
                success: false,
                error: 'All percentages must be positive'
            });
        }
        if (allocation.airdrop < 10) {
            return res.status(400).json({
                success: false,
                error: 'Airdrop allocation must be at least 10%'
            });
        }
        if (allocation.liquidity < 10) {
            return res.status(400).json({
                success: false,
                error: 'Liquidity allocation must be at least 10%'
            });
        }
        const total = allocation.airdrop + allocation.liquidity;
        if (total > 100) {
            return res.status(400).json({
                success: false,
                error: `Airdrop + Liquidity cannot exceed 100% (currently ${total}%)`
            });
        }
        if (!initialLiquidityXLM || initialLiquidityXLM < 10000) {
            return res.status(400).json({
                success: false,
                error: 'Minimum liquidity requirement is 10,000 XLM'
            });
        }
        if (!eventDurationDays || eventDurationDays < 3 || eventDurationDays > 7) {
            return res.status(400).json({
                success: false,
                error: 'Event duration must be between 3 and 7 days'
            });
        }
        const creatorAllocation = 100 - total;
        const result = await (0, tokenService_1.createToken)({
            name,
            symbol,
            decimals: decimals || 7,
            totalSupply,
            mintable: true,
            burnable: false,
            distributorPublicKey
        });
        const eventStartDate = new Date();
        const eventEndDate = new Date(Date.now() + eventDurationDays * 24 * 60 * 60 * 1000);
        res.json({
            success: true,
            data: {
                ...result,
                projectInfo: {
                    description,
                    allocation: {
                        airdrop: allocation.airdrop,
                        liquidity: allocation.liquidity,
                        creator: creatorAllocation
                    },
                    liquidityXLM: initialLiquidityXLM,
                    event: {
                        startDate: eventStartDate,
                        endDate: eventEndDate,
                        durationDays: eventDurationDays,
                        status: 'active'
                    },
                    vesting: vestingEnabled ? { enabled: true, months: vestingMonths } : { enabled: false }
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:assetCode/:issuer', async (req, res, next) => {
    try {
        const { assetCode, issuer } = req.params;
        const info = await (0, tokenService_1.getTokenInfo)(assetCode, issuer);
        res.json({ success: true, data: info });
    }
    catch (error) {
        next(error);
    }
});
router.post('/mint', async (req, res, next) => {
    try {
        const { assetCode, issuerSecret, destination, amount } = req.body;
        const result = await (0, tokenService_1.mintTokens)({ assetCode, issuerSecret, destination, amount });
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.post('/burn', async (req, res, next) => {
    try {
        const { assetCode, issuerPublicKey, fromSecret, amount } = req.body;
        const result = await (0, tokenService_1.burnTokens)({ assetCode, issuerPublicKey, fromSecret, amount });
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.post('/transfer', async (req, res, next) => {
    try {
        const { assetCode, issuerPublicKey, fromSecret, destination, amount } = req.body;
        const result = await (0, tokenService_1.transferTokens)({ assetCode, issuerPublicKey, fromSecret, destination, amount });
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/stake', async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: 'Staking functionality coming soon'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/unstake', async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: 'Unstaking functionality coming soon'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/rewards/:address', async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                pending: 0,
                claimed: 0
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;

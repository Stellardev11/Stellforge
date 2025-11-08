"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path = __importStar(require("path"));
const tokens_1 = __importDefault(require("./routes/tokens"));
const staking_1 = __importDefault(require("./routes/staking"));
const airdrops_1 = __importDefault(require("./routes/airdrops"));
const game_1 = __importDefault(require("./routes/game"));
const campaigns_1 = __importDefault(require("./routes/campaigns"));
const dex_1 = __importDefault(require("./routes/dex"));
const liquidity_1 = __importDefault(require("./routes/liquidity"));
const referrals_1 = __importDefault(require("./routes/referrals"));
const points_1 = __importDefault(require("./routes/points"));
const errorHandler_1 = require("./middleware/errorHandler");
const security_1 = require("./middleware/security");
const initTasks_1 = require("./initTasks");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
app.use((0, cors_1.default)({
    origin: isProduction ? '*' : (process.env.CORS_ORIGIN || 'http://localhost:5000'),
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(security_1.securityMiddleware);
app.use(security_1.checkRateLimit);
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'StellForge API is running',
        network: process.env.STELLAR_NETWORK || 'mainnet',
        horizon: process.env.STELLAR_HORIZON_URL || 'https://horizon.stellar.org',
        environment: isProduction ? 'production' : 'development'
    });
});
app.use('/api/tokens', tokens_1.default);
app.use('/api/staking', staking_1.default);
app.use('/api/airdrops', airdrops_1.default);
app.use('/api/referrals', referrals_1.default);
app.use('/api/game', game_1.default);
app.use('/api/dex', dex_1.default);
app.use('/api/liquidity', liquidity_1.default);
app.use('/api/points', points_1.default);
app.use('/api', campaigns_1.default);
if (isProduction) {
    const frontendDist = path.resolve(__dirname, '../../frontend/dist');
    app.use(express_1.default.static(frontendDist));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
    console.log(`Production mode: Will serve frontend from ${frontendDist}`);
}
app.use(errorHandler_1.errorHandler);
app.listen(PORT, async () => {
    console.log(`StellForge API server running on port ${PORT}`);
    console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
    console.log(`Network: ${process.env.STELLAR_NETWORK || 'mainnet'}`);
    console.log(`Horizon URL: ${process.env.STELLAR_HORIZON_URL || 'https://horizon.stellar.org'}`);
    console.log(`CORS Origin: ${isProduction ? '*' : (process.env.CORS_ORIGIN || 'http://localhost:5000')}`);
    await (0, initTasks_1.initializeDefaultTasks)();
    console.log('✓ Database initialized');
});
exports.default = app;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAmount = exports.validateStellarAddress = exports.validateTokenCreation = void 0;
const validateTokenCreation = (req, res, next) => {
    const { name, symbol, distributorPublicKey } = req.body;
    const errors = [];
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Token name is required and must be a non-empty string');
    }
    if (!symbol || typeof symbol !== 'string' || !/^[A-Z0-9]{1,12}$/.test(symbol)) {
        errors.push('Token symbol must be 1-12 uppercase alphanumeric characters');
    }
    if (!distributorPublicKey || typeof distributorPublicKey !== 'string' || !/^G[A-Z0-9]{55}$/.test(distributorPublicKey)) {
        errors.push('Invalid Stellar public key format for distributor');
    }
    if (req.body.decimals && (isNaN(req.body.decimals) || req.body.decimals < 0 || req.body.decimals > 7)) {
        errors.push('Decimals must be between 0 and 7');
    }
    if (req.body.totalSupply && (isNaN(parseFloat(req.body.totalSupply)) || parseFloat(req.body.totalSupply) <= 0)) {
        errors.push('Total supply must be a positive number');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }
    next();
};
exports.validateTokenCreation = validateTokenCreation;
const validateStellarAddress = (req, res, next) => {
    const addressFields = ['destination', 'address', 'userAddress'];
    const errors = [];
    for (const field of addressFields) {
        if (req.body[field] && !/^G[A-Z0-9]{55}$/.test(req.body[field])) {
            errors.push(`Invalid Stellar address format for ${field}`);
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }
    next();
};
exports.validateStellarAddress = validateStellarAddress;
const validateAmount = (req, res, next) => {
    const { amount } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Amount must be a positive number'
        });
    }
    next();
};
exports.validateAmount = validateAmount;

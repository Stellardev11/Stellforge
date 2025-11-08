"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateTransactionFee = exports.pollTransactionStatus = exports.validateTransaction = exports.getTransactionStatus = exports.submitSignedTransaction = void 0;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
const stellar_1 = require("../utils/stellar");
const submitSignedTransaction = async (xdr) => {
    try {
        const server = (0, stellar_1.getServer)();
        const transaction = stellar_sdk_1.TransactionBuilder.fromXDR(xdr, (0, stellar_1.getNetworkPassphrase)());
        const response = await server.submitTransaction(transaction);
        return {
            hash: response.hash,
            ledger: response.ledger,
            status: 'success'
        };
    }
    catch (error) {
        console.error('Error submitting transaction:', error);
        let errorMessage = 'Failed to submit transaction';
        if (error.response?.data?.extras?.result_codes) {
            const codes = error.response.data.extras.result_codes;
            errorMessage = `Transaction failed: ${codes.transaction || 'unknown error'}`;
            if (codes.operations) {
                errorMessage += ` | Operations: ${codes.operations.join(', ')}`;
            }
        }
        else if (error.message) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};
exports.submitSignedTransaction = submitSignedTransaction;
const getTransactionStatus = async (hash) => {
    try {
        const server = (0, stellar_1.getServer)();
        const transaction = await server.transactions().transaction(hash).call();
        return {
            hash: transaction.hash,
            status: transaction.successful ? 'success' : 'failed',
            ledger: transaction.ledger_attr,
            createdAt: transaction.created_at,
            resultXdr: transaction.result_xdr
        };
    }
    catch (error) {
        if (error.response?.status === 404) {
            return {
                hash,
                status: 'not_found'
            };
        }
        console.error('Error fetching transaction status:', error);
        return {
            hash,
            status: 'pending'
        };
    }
};
exports.getTransactionStatus = getTransactionStatus;
const validateTransaction = async (xdr) => {
    try {
        const transaction = stellar_sdk_1.TransactionBuilder.fromXDR(xdr, (0, stellar_1.getNetworkPassphrase)());
        if (!(transaction instanceof stellar_sdk_1.Transaction)) {
            return {
                valid: false,
                error: 'Invalid transaction XDR'
            };
        }
        const server = (0, stellar_1.getServer)();
        const sourceAccount = await server.loadAccount(transaction.source);
        if (!sourceAccount) {
            return {
                valid: false,
                error: 'Source account not found'
            };
        }
        if (transaction.sequence !== (BigInt(sourceAccount.sequence) + BigInt(1)).toString()) {
            return {
                valid: false,
                error: 'Invalid sequence number'
            };
        }
        return { valid: true };
    }
    catch (error) {
        console.error('Error validating transaction:', error);
        return {
            valid: false,
            error: error.message || 'Transaction validation failed'
        };
    }
};
exports.validateTransaction = validateTransaction;
const pollTransactionStatus = async (hash, maxAttempts = 10, intervalMs = 2000) => {
    for (let i = 0; i < maxAttempts; i++) {
        const status = await (0, exports.getTransactionStatus)(hash);
        if (status.status === 'success' || status.status === 'failed') {
            return status;
        }
        if (i < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
    }
    return {
        hash,
        status: 'pending',
        errorMessage: 'Transaction confirmation timeout'
    };
};
exports.pollTransactionStatus = pollTransactionStatus;
const estimateTransactionFee = async (operationCount = 1) => {
    try {
        const server = (0, stellar_1.getServer)();
        const feeStats = await server.feeStats();
        const baseFee = Math.max(parseInt(feeStats.fee_charged.mode), parseInt(feeStats.fee_charged.p50));
        const totalFee = baseFee * operationCount;
        return totalFee.toString();
    }
    catch (error) {
        console.error('Error estimating fee:', error);
        return (100 * operationCount).toString();
    }
};
exports.estimateTransactionFee = estimateTransactionFee;

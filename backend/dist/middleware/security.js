"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = getClientIp;
exports.getDeviceFingerprint = getDeviceFingerprint;
exports.checkRateLimit = checkRateLimit;
exports.logSecurityEvent = logSecurityEvent;
exports.securityMiddleware = securityMiddleware;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const IP_RATE_LIMITS = {};
const MAX_REQUESTS_PER_IP_PER_HOUR = 100;
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
}
function getDeviceFingerprint(req) {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    return Buffer.from(`${userAgent}:${acceptLanguage}:${acceptEncoding}`).toString('base64');
}
async function checkRateLimit(req, res, next) {
    const ip = getClientIp(req);
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    if (!IP_RATE_LIMITS[ip]) {
        IP_RATE_LIMITS[ip] = { count: 1, resetAt: now + 60 * 60 * 1000 };
        return next();
    }
    if (now > IP_RATE_LIMITS[ip].resetAt) {
        IP_RATE_LIMITS[ip] = { count: 1, resetAt: now + 60 * 60 * 1000 };
        return next();
    }
    IP_RATE_LIMITS[ip].count++;
    if (IP_RATE_LIMITS[ip].count > MAX_REQUESTS_PER_IP_PER_HOUR) {
        await logSecurityEvent(req, 'RATE_LIMIT_EXCEEDED', { ip, count: IP_RATE_LIMITS[ip].count }, true);
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    next();
}
async function logSecurityEvent(req, action, details, flagged = false) {
    const ip = getClientIp(req);
    const deviceFingerprint = getDeviceFingerprint(req);
    const walletAddress = (req.body?.walletAddress || req.query?.walletAddress);
    try {
        await db_1.db.insert(schema_1.securityAuditLogs).values({
            walletAddress,
            ipAddress: ip,
            deviceFingerprint,
            action,
            details,
            flagged,
        });
    }
    catch (error) {
        console.error('Failed to log security event:', error);
    }
}
function securityMiddleware(req, res, next) {
    const ip = getClientIp(req);
    const fingerprint = getDeviceFingerprint(req);
    req.security = {
        ip,
        fingerprint,
    };
    next();
}

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { securityAuditLogs } from '../db/schema';

const IP_RATE_LIMITS: Record<string, { count: number; resetAt: number }> = {};
const MAX_REQUESTS_PER_IP_PER_HOUR = 100;

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export function getDeviceFingerprint(req: Request): string {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  return Buffer.from(`${userAgent}:${acceptLanguage}:${acceptEncoding}`).toString('base64');
}

export async function checkRateLimit(req: Request, res: Response, next: NextFunction) {
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

export async function logSecurityEvent(
  req: Request,
  action: string,
  details: any,
  flagged: boolean = false
) {
  const ip = getClientIp(req);
  const deviceFingerprint = getDeviceFingerprint(req);
  const walletAddress = (req.body?.walletAddress || req.query?.walletAddress) as string | undefined;

  try {
    await db.insert(securityAuditLogs).values({
      walletAddress,
      ipAddress: ip,
      deviceFingerprint,
      action,
      details,
      flagged,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const fingerprint = getDeviceFingerprint(req);
  
  (req as any).security = {
    ip,
    fingerprint,
  };
  
  next();
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralService = exports.ReferralService = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const REFERRAL_REWARD_POINTS = 5;
class ReferralService {
    generateReferralCode(walletAddress) {
        const hash = (0, crypto_1.randomBytes)(4).toString('hex');
        return `${walletAddress.substring(0, 8)}-${hash}`.toUpperCase();
    }
    async getOrCreateWallet(walletAddress) {
        const [existing] = await db_1.db.select().from(schema_1.wallets).where((0, drizzle_orm_1.eq)(schema_1.wallets.walletAddress, walletAddress));
        if (existing) {
            return existing;
        }
        const [newWallet] = await db_1.db.insert(schema_1.wallets).values({
            walletAddress,
            receivedInitialBonus: false,
        }).returning();
        await db_1.db.insert(schema_1.pointBalances).values({
            walletId: newWallet.id,
            walletAddress: walletAddress,
            pSlfPoints: '0',
        });
        return newWallet;
    }
    async getOrCreateReferralLink(walletAddress) {
        const wallet = await this.getOrCreateWallet(walletAddress);
        const [existing] = await db_1.db.select()
            .from(schema_1.referralLinks)
            .where((0, drizzle_orm_1.eq)(schema_1.referralLinks.walletAddress, walletAddress));
        if (existing) {
            return existing;
        }
        const referralCode = this.generateReferralCode(walletAddress);
        const [newLink] = await db_1.db.insert(schema_1.referralLinks).values({
            walletId: wallet.id,
            walletAddress,
            referralCode,
            totalReferrals: 0,
            successfulReferrals: 0,
        }).returning();
        return newLink;
    }
    async recordReferral(referralCode, refereeWalletAddress, ipAddress, deviceFingerprint) {
        const [referralLink] = await db_1.db.select()
            .from(schema_1.referralLinks)
            .where((0, drizzle_orm_1.eq)(schema_1.referralLinks.referralCode, referralCode));
        if (!referralLink) {
            throw new Error('Invalid referral code');
        }
        const refereeWallet = await this.getOrCreateWallet(refereeWalletAddress);
        if (referralLink.walletAddress === refereeWalletAddress) {
            throw new Error('Cannot refer yourself');
        }
        const [existingReferral] = await db_1.db.select()
            .from(schema_1.referralEvents)
            .where((0, drizzle_orm_1.eq)(schema_1.referralEvents.refereeWalletId, refereeWallet.id));
        if (existingReferral) {
            throw new Error('User already referred');
        }
        await db_1.db.transaction(async (tx) => {
            await tx.insert(schema_1.referralEvents).values({
                referrerWalletId: referralLink.walletId,
                refereeWalletId: refereeWallet.id,
                referralCode,
                ipAddress,
                deviceFingerprint,
                status: 'confirmed',
                pointsAwarded: REFERRAL_REWARD_POINTS.toString(),
            });
            await tx.update(schema_1.referralLinks)
                .set({
                totalReferrals: (0, drizzle_orm_1.sql) `${schema_1.referralLinks.totalReferrals} + 1`,
                successfulReferrals: (0, drizzle_orm_1.sql) `${schema_1.referralLinks.successfulReferrals} + 1`,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.referralLinks.id, referralLink.id));
            await tx.update(schema_1.pointBalances)
                .set({
                pSlfPoints: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pSlfPoints} + ${REFERRAL_REWARD_POINTS}`,
                pointsEarnedFromReferrals: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pointsEarnedFromReferrals} + ${REFERRAL_REWARD_POINTS}`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.pointBalances.walletId, referralLink.walletId));
        });
        return { referrerWallet: referralLink.walletAddress, pointsAwarded: REFERRAL_REWARD_POINTS };
    }
    async getReferralStats(walletAddress) {
        const [link] = await db_1.db.select()
            .from(schema_1.referralLinks)
            .where((0, drizzle_orm_1.eq)(schema_1.referralLinks.walletAddress, walletAddress));
        return link;
    }
}
exports.ReferralService = ReferralService;
exports.referralService = new ReferralService();

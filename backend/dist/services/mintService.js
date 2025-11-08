"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintService = exports.MintService = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const INITIAL_BONUS_POINTS = 10;
const MAX_BONUS_RECIPIENTS = 20000;
class MintService {
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
    async awardInitialBonus(walletAddress) {
        const wallet = await this.getOrCreateWallet(walletAddress);
        if (wallet.receivedInitialBonus) {
            return { awarded: false, points: 0 };
        }
        let bonusAwarded = false;
        await db_1.db.transaction(async (tx) => {
            const [stats] = await tx.select().from(schema_1.userStats).limit(1);
            if (stats) {
                const lockedStats = await tx.execute((0, drizzle_orm_1.sql) `SELECT * FROM ${schema_1.userStats} WHERE ${schema_1.userStats.id} = ${stats.id} FOR UPDATE`);
                const currentBonusRecipients = stats.usersWithInitialBonus || 0;
                if (currentBonusRecipients >= MAX_BONUS_RECIPIENTS) {
                    bonusAwarded = false;
                    return;
                }
                await tx.update(schema_1.wallets)
                    .set({ receivedInitialBonus: true })
                    .where((0, drizzle_orm_1.eq)(schema_1.wallets.id, wallet.id));
                await tx.update(schema_1.pointBalances)
                    .set({
                    pSlfPoints: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pSlfPoints} + ${INITIAL_BONUS_POINTS}`,
                    initialBonusReceived: true,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.pointBalances.walletId, wallet.id));
                await tx.update(schema_1.userStats)
                    .set({
                    usersWithInitialBonus: (0, drizzle_orm_1.sql) `${schema_1.userStats.usersWithInitialBonus} + 1`,
                    totalPSlfDistributed: (0, drizzle_orm_1.sql) `${schema_1.userStats.totalPSlfDistributed} + ${INITIAL_BONUS_POINTS}`,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.userStats.id, stats.id));
                bonusAwarded = true;
            }
            else {
                await tx.update(schema_1.wallets)
                    .set({ receivedInitialBonus: true })
                    .where((0, drizzle_orm_1.eq)(schema_1.wallets.id, wallet.id));
                await tx.update(schema_1.pointBalances)
                    .set({
                    pSlfPoints: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pSlfPoints} + ${INITIAL_BONUS_POINTS}`,
                    initialBonusReceived: true,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.pointBalances.walletId, wallet.id));
                await tx.insert(schema_1.userStats).values({
                    totalUsers: 1,
                    usersWithInitialBonus: 1,
                    totalPSlfDistributed: INITIAL_BONUS_POINTS.toString(),
                });
                bonusAwarded = true;
            }
        });
        return { awarded: bonusAwarded, points: bonusAwarded ? INITIAL_BONUS_POINTS : 0 };
    }
    async mintPoints(walletAddress, xlmAmount, transactionHash) {
        const wallet = await this.getOrCreateWallet(walletAddress);
        const pSlfPoints = xlmAmount;
        await db_1.db.transaction(async (tx) => {
            await tx.insert(schema_1.pointMints).values({
                walletId: wallet.id,
                walletAddress,
                xlmAmount: xlmAmount.toString(),
                pSlfPointsAwarded: pSlfPoints.toString(),
                transactionHash,
                status: 'confirmed',
            });
            await tx.update(schema_1.pointBalances)
                .set({
                pSlfPoints: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pSlfPoints} + ${pSlfPoints}`,
                pointsEarnedFromMinting: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pointsEarnedFromMinting} + ${pSlfPoints}`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.pointBalances.walletId, wallet.id));
            const [settings] = await tx.select().from(schema_1.mintSettings).limit(1);
            if (settings) {
                await tx.update(schema_1.mintSettings)
                    .set({
                    totalXlmReceived: (0, drizzle_orm_1.sql) `${schema_1.mintSettings.totalXlmReceived} + ${xlmAmount}`,
                    totalPSlfMinted: (0, drizzle_orm_1.sql) `${schema_1.mintSettings.totalPSlfMinted} + ${pSlfPoints}`,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.mintSettings.id, settings.id));
            }
            else {
                await tx.insert(schema_1.mintSettings).values({
                    totalXlmReceived: xlmAmount.toString(),
                    totalPSlfMinted: pSlfPoints.toString(),
                });
            }
        });
        return { pSlfPoints };
    }
    async getPointBalance(walletAddress) {
        const [balance] = await db_1.db.select()
            .from(schema_1.pointBalances)
            .where((0, drizzle_orm_1.eq)(schema_1.pointBalances.walletAddress, walletAddress));
        return balance || null;
    }
    async getMintSettings() {
        const [settings] = await db_1.db.select().from(schema_1.mintSettings).limit(1);
        return settings;
    }
    async getUserStats() {
        const [stats] = await db_1.db.select().from(schema_1.userStats).limit(1);
        return stats;
    }
    async recordPlatformReward(walletAddress, xlmSpent, transactionHash, transactionType) {
        const wallet = await this.getOrCreateWallet(walletAddress);
        const pSlfPoints = xlmSpent;
        await db_1.db.transaction(async (tx) => {
            await tx.insert(schema_1.transactionRewards).values({
                walletId: wallet.id,
                walletAddress,
                transactionHash,
                xlmSpent: xlmSpent.toString(),
                pSlfPointsAwarded: pSlfPoints.toString(),
                transactionType,
            });
            await tx.update(schema_1.pointBalances)
                .set({
                pSlfPoints: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pSlfPoints} + ${pSlfPoints}`,
                pointsEarnedFromPlatform: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pointsEarnedFromPlatform} + ${pSlfPoints}`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.pointBalances.walletId, wallet.id));
        });
        return { pSlfPoints };
    }
}
exports.MintService = MintService;
exports.mintService = new MintService();

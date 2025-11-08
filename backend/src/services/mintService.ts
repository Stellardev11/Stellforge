import { db } from '../db';
import { wallets, pointMints, pointBalances, mintSettings, userStats, transactionRewards } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const INITIAL_BONUS_POINTS = 10;
const MAX_BONUS_RECIPIENTS = 20000;

export class MintService {
  async getOrCreateWallet(walletAddress: string) {
    const [existing] = await db.select().from(wallets).where(eq(wallets.walletAddress, walletAddress));
    
    if (existing) {
      return existing;
    }

    const [newWallet] = await db.insert(wallets).values({
      walletAddress,
      receivedInitialBonus: false,
    }).returning();

    await db.insert(pointBalances).values({
      walletId: newWallet.id,
      walletAddress: walletAddress,
      pSlfPoints: '0',
    });

    return newWallet;
  }

  async awardInitialBonus(walletAddress: string): Promise<{ awarded: boolean; points: number }> {
    const wallet = await this.getOrCreateWallet(walletAddress);
    
    if (wallet.receivedInitialBonus) {
      return { awarded: false, points: 0 };
    }

    let bonusAwarded = false;

    await db.transaction(async (tx) => {
      const [stats] = await tx.select().from(userStats).limit(1);
      
      if (stats) {
        const lockedStats = await tx.execute(
          sql`SELECT * FROM ${userStats} WHERE ${userStats.id} = ${stats.id} FOR UPDATE`
        );
        const currentBonusRecipients = stats.usersWithInitialBonus || 0;

        if (currentBonusRecipients >= MAX_BONUS_RECIPIENTS) {
          bonusAwarded = false;
          return;
        }

        await tx.update(wallets)
          .set({ receivedInitialBonus: true })
          .where(eq(wallets.id, wallet.id));

        await tx.update(pointBalances)
          .set({
            pSlfPoints: sql`${pointBalances.pSlfPoints} + ${INITIAL_BONUS_POINTS}`,
            initialBonusReceived: true,
          })
          .where(eq(pointBalances.walletId, wallet.id));

        await tx.update(userStats)
          .set({
            usersWithInitialBonus: sql`${userStats.usersWithInitialBonus} + 1`,
            totalPSlfDistributed: sql`${userStats.totalPSlfDistributed} + ${INITIAL_BONUS_POINTS}`,
          })
          .where(eq(userStats.id, stats.id));

        bonusAwarded = true;
      } else {
        await tx.update(wallets)
          .set({ receivedInitialBonus: true })
          .where(eq(wallets.id, wallet.id));

        await tx.update(pointBalances)
          .set({
            pSlfPoints: sql`${pointBalances.pSlfPoints} + ${INITIAL_BONUS_POINTS}`,
            initialBonusReceived: true,
          })
          .where(eq(pointBalances.walletId, wallet.id));

        await tx.insert(userStats).values({
          totalUsers: 1,
          usersWithInitialBonus: 1,
          totalPSlfDistributed: INITIAL_BONUS_POINTS.toString(),
        });

        bonusAwarded = true;
      }
    });

    return { awarded: bonusAwarded, points: bonusAwarded ? INITIAL_BONUS_POINTS : 0 };
  }

  async mintPoints(walletAddress: string, xlmAmount: number, transactionHash: string) {
    const wallet = await this.getOrCreateWallet(walletAddress);
    
    const pSlfPoints = 1;

    await db.transaction(async (tx) => {
      await tx.insert(pointMints).values({
        walletId: wallet.id,
        walletAddress,
        xlmAmount: xlmAmount.toString(),
        pSlfPointsAwarded: pSlfPoints.toString(),
        transactionHash,
        status: 'confirmed',
      });

      await tx.update(pointBalances)
        .set({
          pSlfPoints: sql`${pointBalances.pSlfPoints} + ${pSlfPoints}`,
          pointsEarnedFromMinting: sql`${pointBalances.pointsEarnedFromMinting} + ${pSlfPoints}`,
          updatedAt: new Date(),
        })
        .where(eq(pointBalances.walletId, wallet.id));

      const [settings] = await tx.select().from(mintSettings).limit(1);
      if (settings) {
        await tx.update(mintSettings)
          .set({
            totalXlmReceived: sql`${mintSettings.totalXlmReceived} + ${xlmAmount}`,
            totalPSlfMinted: sql`${mintSettings.totalPSlfMinted} + ${pSlfPoints}`,
            updatedAt: new Date(),
          })
          .where(eq(mintSettings.id, settings.id));
      } else {
        await tx.insert(mintSettings).values({
          totalXlmReceived: xlmAmount.toString(),
          totalPSlfMinted: pSlfPoints.toString(),
        });
      }
    });

    return { pSlfPoints };
  }

  async getPointBalance(walletAddress: string) {
    const [balance] = await db.select()
      .from(pointBalances)
      .where(eq(pointBalances.walletAddress, walletAddress));
    
    return balance || null;
  }

  async getMintSettings() {
    const [settings] = await db.select().from(mintSettings).limit(1);
    return settings;
  }

  async getUserStats() {
    const [stats] = await db.select().from(userStats).limit(1);
    return stats;
  }

  async recordPlatformReward(walletAddress: string, xlmSpent: number, transactionHash: string, transactionType: string) {
    const wallet = await this.getOrCreateWallet(walletAddress);
    const pSlfPoints = xlmSpent;

    await db.transaction(async (tx) => {
      await tx.insert(transactionRewards).values({
        walletId: wallet.id,
        walletAddress,
        transactionHash,
        xlmSpent: xlmSpent.toString(),
        pSlfPointsAwarded: pSlfPoints.toString(),
        transactionType,
      });

      await tx.update(pointBalances)
        .set({
          pSlfPoints: sql`${pointBalances.pSlfPoints} + ${pSlfPoints}`,
          pointsEarnedFromPlatform: sql`${pointBalances.pointsEarnedFromPlatform} + ${pSlfPoints}`,
          updatedAt: new Date(),
        })
        .where(eq(pointBalances.walletId, wallet.id));
    });

    return { pSlfPoints };
  }
}

export const mintService = new MintService();

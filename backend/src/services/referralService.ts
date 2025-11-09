import { db } from '../db';
import { wallets, referralLinks, referralEvents, pointBalances } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const REFERRAL_REWARD_POINTS = 5;

export class ReferralService {
  generateReferralCode(walletAddress: string): string {
    const hash = randomBytes(4).toString('hex');
    return `${walletAddress.substring(0, 8)}-${hash}`.toUpperCase();
  }

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
      starPoints: '0',
    });

    return newWallet;
  }

  async getOrCreateReferralLink(walletAddress: string) {
    const wallet = await this.getOrCreateWallet(walletAddress);

    const [existing] = await db.select()
      .from(referralLinks)
      .where(eq(referralLinks.walletAddress, walletAddress));
    
    if (existing) {
      return existing;
    }

    const referralCode = this.generateReferralCode(walletAddress);

    const [newLink] = await db.insert(referralLinks).values({
      walletId: wallet.id,
      walletAddress,
      referralCode,
      totalReferrals: 0,
      successfulReferrals: 0,
    }).returning();

    return newLink;
  }

  async recordReferral(
    referralCode: string,
    refereeWalletAddress: string,
    ipAddress: string,
    deviceFingerprint: string
  ) {
    const [referralLink] = await db.select()
      .from(referralLinks)
      .where(eq(referralLinks.referralCode, referralCode));

    if (!referralLink) {
      throw new Error('Invalid referral code');
    }

    const refereeWallet = await this.getOrCreateWallet(refereeWalletAddress);

    if (referralLink.walletAddress === refereeWalletAddress) {
      throw new Error('Cannot refer yourself');
    }

    const [existingReferral] = await db.select()
      .from(referralEvents)
      .where(eq(referralEvents.refereeWalletId, refereeWallet.id));

    if (existingReferral) {
      throw new Error('User already referred');
    }

    await db.transaction(async (tx) => {
      await tx.insert(referralEvents).values({
        referrerWalletId: referralLink.walletId,
        refereeWalletId: refereeWallet.id,
        referralCode,
        ipAddress,
        deviceFingerprint,
        status: 'confirmed',
        pointsAwarded: REFERRAL_REWARD_POINTS.toString(),
      });

      await tx.update(referralLinks)
        .set({
          totalReferrals: sql`${referralLinks.totalReferrals} + 1`,
          successfulReferrals: sql`${referralLinks.successfulReferrals} + 1`,
        })
        .where(eq(referralLinks.id, referralLink.id));

      await tx.update(pointBalances)
        .set({
          starPoints: sql`${pointBalances.starPoints} + ${REFERRAL_REWARD_POINTS}`,
          pointsEarnedFromReferrals: sql`${pointBalances.pointsEarnedFromReferrals} + ${REFERRAL_REWARD_POINTS}`,
          updatedAt: new Date(),
        })
        .where(eq(pointBalances.walletId, referralLink.walletId));
    });

    return { referrerWallet: referralLink.walletAddress, pointsAwarded: REFERRAL_REWARD_POINTS };
  }

  async getReferralStats(walletAddress: string) {
    const [link] = await db.select()
      .from(referralLinks)
      .where(eq(referralLinks.walletAddress, walletAddress));

    return link;
  }
}

export const referralService = new ReferralService();

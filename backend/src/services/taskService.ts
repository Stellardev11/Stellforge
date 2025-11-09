import { db } from '../db';
import { tasks, taskCompletions, pointBalances, wallets } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';

export class TaskService {
  async getActiveTasks() {
    return await db.select().from(tasks).where(eq(tasks.isActive, true));
  }

  async completeTask(walletAddress: string, taskId: string, proofData?: any) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.walletAddress, walletAddress));
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    
    if (!task) {
      throw new Error('Task not found');
    }

    if (!task.isActive) {
      throw new Error('Task is not active');
    }

    const [existing] = await db.select()
      .from(taskCompletions)
      .where(and(
        eq(taskCompletions.taskId, taskId),
        eq(taskCompletions.walletId, wallet.id)
      ));

    if (existing) {
      throw new Error('Task already completed');
    }

    const pointsAwarded = parseFloat(task.starReward);

    await db.transaction(async (tx) => {
      await tx.insert(taskCompletions).values({
        taskId,
        walletId: wallet.id,
        walletAddress,
        pointsAwarded: pointsAwarded.toString(),
        proofData,
      });

      await tx.update(pointBalances)
        .set({
          starPoints: sql`${pointBalances.starPoints} + ${pointsAwarded}`,
          pointsEarnedFromTasks: sql`${pointBalances.pointsEarnedFromTasks} + ${pointsAwarded}`,
          updatedAt: new Date(),
        })
        .where(eq(pointBalances.walletId, wallet.id));
    });

    return { pointsAwarded };
  }

  async getUserCompletedTasks(walletAddress: string) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.walletAddress, walletAddress));
    
    if (!wallet) {
      return [];
    }

    return await db.select()
      .from(taskCompletions)
      .where(eq(taskCompletions.walletId, wallet.id));
  }
}

export const taskService = new TaskService();

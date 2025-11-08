"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = exports.TaskService = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class TaskService {
    async getActiveTasks() {
        return await db_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.isActive, true));
    }
    async completeTask(walletAddress, taskId, proofData) {
        const [wallet] = await db_1.db.select().from(schema_1.wallets).where((0, drizzle_orm_1.eq)(schema_1.wallets.walletAddress, walletAddress));
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        const [task] = await db_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.id, taskId));
        if (!task) {
            throw new Error('Task not found');
        }
        if (!task.isActive) {
            throw new Error('Task is not active');
        }
        const [existing] = await db_1.db.select()
            .from(schema_1.taskCompletions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.taskCompletions.taskId, taskId), (0, drizzle_orm_1.eq)(schema_1.taskCompletions.walletId, wallet.id)));
        if (existing) {
            throw new Error('Task already completed');
        }
        const pointsAwarded = parseFloat(task.pSlfReward);
        await db_1.db.transaction(async (tx) => {
            await tx.insert(schema_1.taskCompletions).values({
                taskId,
                walletId: wallet.id,
                walletAddress,
                pointsAwarded: pointsAwarded.toString(),
                proofData,
            });
            await tx.update(schema_1.pointBalances)
                .set({
                pSlfPoints: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pSlfPoints} + ${pointsAwarded}`,
                pointsEarnedFromTasks: (0, drizzle_orm_1.sql) `${schema_1.pointBalances.pointsEarnedFromTasks} + ${pointsAwarded}`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.pointBalances.walletId, wallet.id));
        });
        return { pointsAwarded };
    }
    async getUserCompletedTasks(walletAddress) {
        const [wallet] = await db_1.db.select().from(schema_1.wallets).where((0, drizzle_orm_1.eq)(schema_1.wallets.walletAddress, walletAddress));
        if (!wallet) {
            return [];
        }
        return await db_1.db.select()
            .from(schema_1.taskCompletions)
            .where((0, drizzle_orm_1.eq)(schema_1.taskCompletions.walletId, wallet.id));
    }
}
exports.TaskService = TaskService;
exports.taskService = new TaskService();

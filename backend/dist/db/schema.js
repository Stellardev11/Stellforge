"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userStats = exports.mintSettings = exports.taskCompletions = exports.tasks = exports.securityAuditLogs = exports.transactionRewards = exports.referralEvents = exports.referralLinks = exports.pointBalances = exports.pointMints = exports.wallets = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.wallets = (0, pg_core_1.pgTable)('wallets', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    walletAddress: (0, pg_core_1.text)('wallet_address').notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    receivedInitialBonus: (0, pg_core_1.boolean)('received_initial_bonus').default(false).notNull(),
    totalPointsEarned: (0, pg_core_1.decimal)('total_points_earned', { precision: 20, scale: 2 }).default('0').notNull(),
    lastActivityAt: (0, pg_core_1.timestamp)('last_activity_at').defaultNow(),
});
exports.pointMints = (0, pg_core_1.pgTable)('point_mints', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    walletId: (0, pg_core_1.uuid)('wallet_id').references(() => exports.wallets.id).notNull(),
    walletAddress: (0, pg_core_1.text)('wallet_address').notNull(),
    xlmAmount: (0, pg_core_1.decimal)('xlm_amount', { precision: 20, scale: 7 }).notNull(),
    pSlfPointsAwarded: (0, pg_core_1.decimal)('p_slf_points_awarded', { precision: 20, scale: 2 }).notNull(),
    transactionHash: (0, pg_core_1.text)('transaction_hash').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    status: (0, pg_core_1.text)('status').default('confirmed').notNull(),
}, (table) => ({
    walletIdIdx: (0, pg_core_1.index)('mint_wallet_id_idx').on(table.walletId),
    txHashIdx: (0, pg_core_1.index)('mint_tx_hash_idx').on(table.transactionHash),
}));
exports.pointBalances = (0, pg_core_1.pgTable)('point_balances', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    walletId: (0, pg_core_1.uuid)('wallet_id').references(() => exports.wallets.id).notNull().unique(),
    walletAddress: (0, pg_core_1.text)('wallet_address').notNull().unique(),
    pSlfPoints: (0, pg_core_1.decimal)('p_slf_points', { precision: 20, scale: 2 }).default('0').notNull(),
    pointsEarnedFromMinting: (0, pg_core_1.decimal)('points_earned_from_minting', { precision: 20, scale: 2 }).default('0').notNull(),
    pointsEarnedFromPlatform: (0, pg_core_1.decimal)('points_earned_from_platform', { precision: 20, scale: 2 }).default('0').notNull(),
    pointsEarnedFromReferrals: (0, pg_core_1.decimal)('points_earned_from_referrals', { precision: 20, scale: 2 }).default('0').notNull(),
    pointsEarnedFromTasks: (0, pg_core_1.decimal)('points_earned_from_tasks', { precision: 20, scale: 2 }).default('0').notNull(),
    initialBonusReceived: (0, pg_core_1.boolean)('initial_bonus_received').default(false).notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    walletIdIdx: (0, pg_core_1.index)('points_wallet_id_idx').on(table.walletId),
}));
exports.referralLinks = (0, pg_core_1.pgTable)('referral_links', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    walletId: (0, pg_core_1.uuid)('wallet_id').references(() => exports.wallets.id).notNull().unique(),
    walletAddress: (0, pg_core_1.text)('wallet_address').notNull().unique(),
    referralCode: (0, pg_core_1.text)('referral_code').notNull().unique(),
    totalReferrals: (0, pg_core_1.integer)('total_referrals').default(0).notNull(),
    successfulReferrals: (0, pg_core_1.integer)('successful_referrals').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    referralCodeIdx: (0, pg_core_1.index)('referral_code_idx').on(table.referralCode),
}));
exports.referralEvents = (0, pg_core_1.pgTable)('referral_events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    referrerWalletId: (0, pg_core_1.uuid)('referrer_wallet_id').references(() => exports.wallets.id).notNull(),
    refereeWalletId: (0, pg_core_1.uuid)('referee_wallet_id').references(() => exports.wallets.id).notNull(),
    referralCode: (0, pg_core_1.text)('referral_code').notNull(),
    ipAddress: (0, pg_core_1.text)('ip_address'),
    deviceFingerprint: (0, pg_core_1.text)('device_fingerprint'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    status: (0, pg_core_1.text)('status').default('pending').notNull(),
    pointsAwarded: (0, pg_core_1.decimal)('points_awarded', { precision: 20, scale: 2 }).default('0'),
}, (table) => ({
    referrerIdx: (0, pg_core_1.index)('referrer_wallet_id_idx').on(table.referrerWalletId),
    refereeIdx: (0, pg_core_1.index)('referee_wallet_id_idx').on(table.refereeWalletId),
    ipIdx: (0, pg_core_1.index)('ip_address_idx').on(table.ipAddress),
}));
exports.transactionRewards = (0, pg_core_1.pgTable)('transaction_rewards', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    walletId: (0, pg_core_1.uuid)('wallet_id').references(() => exports.wallets.id).notNull(),
    walletAddress: (0, pg_core_1.text)('wallet_address').notNull(),
    transactionHash: (0, pg_core_1.text)('transaction_hash').notNull(),
    xlmSpent: (0, pg_core_1.decimal)('xlm_spent', { precision: 20, scale: 7 }).notNull(),
    pSlfPointsAwarded: (0, pg_core_1.decimal)('p_slf_points_awarded', { precision: 20, scale: 2 }).notNull(),
    transactionType: (0, pg_core_1.text)('transaction_type').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    walletIdIdx: (0, pg_core_1.index)('tx_rewards_wallet_id_idx').on(table.walletId),
    txHashIdx: (0, pg_core_1.uniqueIndex)('tx_hash_idx').on(table.transactionHash),
}));
exports.securityAuditLogs = (0, pg_core_1.pgTable)('security_audit_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    walletAddress: (0, pg_core_1.text)('wallet_address'),
    ipAddress: (0, pg_core_1.text)('ip_address'),
    deviceFingerprint: (0, pg_core_1.text)('device_fingerprint'),
    action: (0, pg_core_1.text)('action').notNull(),
    details: (0, pg_core_1.jsonb)('details'),
    flagged: (0, pg_core_1.boolean)('flagged').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    walletIdx: (0, pg_core_1.index)('audit_wallet_idx').on(table.walletAddress),
    ipIdx: (0, pg_core_1.index)('audit_ip_idx').on(table.ipAddress),
    flaggedIdx: (0, pg_core_1.index)('audit_flagged_idx').on(table.flagged),
}));
exports.tasks = (0, pg_core_1.pgTable)('tasks', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    taskType: (0, pg_core_1.text)('task_type').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    pSlfReward: (0, pg_core_1.decimal)('p_slf_reward', { precision: 20, scale: 2 }).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    maxCompletions: (0, pg_core_1.integer)('max_completions'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.taskCompletions = (0, pg_core_1.pgTable)('task_completions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    taskId: (0, pg_core_1.uuid)('task_id').references(() => exports.tasks.id).notNull(),
    walletId: (0, pg_core_1.uuid)('wallet_id').references(() => exports.wallets.id).notNull(),
    walletAddress: (0, pg_core_1.text)('wallet_address').notNull(),
    completedAt: (0, pg_core_1.timestamp)('completed_at').defaultNow().notNull(),
    pointsAwarded: (0, pg_core_1.decimal)('points_awarded', { precision: 20, scale: 2 }).notNull(),
    proofData: (0, pg_core_1.jsonb)('proof_data'),
}, (table) => ({
    taskWalletUnique: (0, pg_core_1.uniqueIndex)('task_wallet_unique_idx').on(table.taskId, table.walletId),
    walletIdIdx: (0, pg_core_1.index)('task_comp_wallet_idx').on(table.walletId),
}));
exports.mintSettings = (0, pg_core_1.pgTable)('mint_settings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    totalSupply: (0, pg_core_1.decimal)('total_supply', { precision: 20, scale: 2 }).default('100000000').notNull(),
    pointHoldersAllocationPercent: (0, pg_core_1.decimal)('point_holders_allocation_percent', { precision: 5, scale: 2 }).default('60').notNull(),
    listingReservePercent: (0, pg_core_1.decimal)('listing_reserve_percent', { precision: 5, scale: 2 }).default('15').notNull(),
    teamPercent: (0, pg_core_1.decimal)('team_percent', { precision: 5, scale: 2 }).default('15').notNull(),
    launchPercent: (0, pg_core_1.decimal)('launch_percent', { precision: 5, scale: 2 }).default('5').notNull(),
    otherPercent: (0, pg_core_1.decimal)('other_percent', { precision: 5, scale: 2 }).default('5').notNull(),
    mintingActive: (0, pg_core_1.boolean)('minting_active').default(true).notNull(),
    treasuryWalletAddress: (0, pg_core_1.text)('treasury_wallet_address'),
    totalXlmReceived: (0, pg_core_1.decimal)('total_xlm_received', { precision: 20, scale: 7 }).default('0').notNull(),
    totalPSlfMinted: (0, pg_core_1.decimal)('total_p_slf_minted', { precision: 20, scale: 2 }).default('0').notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.userStats = (0, pg_core_1.pgTable)('user_stats', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    totalUsers: (0, pg_core_1.integer)('total_users').default(0).notNull(),
    usersWithInitialBonus: (0, pg_core_1.integer)('users_with_initial_bonus').default(0).notNull(),
    totalPSlfDistributed: (0, pg_core_1.decimal)('total_p_slf_distributed', { precision: 20, scale: 2 }).default('0').notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});

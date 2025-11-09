import { pgTable, text, integer, timestamp, boolean, decimal, uuid, index, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletAddress: text('wallet_address').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  receivedInitialBonus: boolean('received_initial_bonus').default(false).notNull(),
  totalPointsEarned: decimal('total_points_earned', { precision: 20, scale: 2 }).default('0').notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow(),
});

export const pointMints = pgTable('point_mints', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').references(() => wallets.id).notNull(),
  walletAddress: text('wallet_address').notNull(),
  xlmAmount: decimal('xlm_amount', { precision: 20, scale: 7 }).notNull(),
  starPointsAwarded: decimal('star_points_awarded', { precision: 20, scale: 2 }).notNull(),
  transactionHash: text('transaction_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: text('status').default('confirmed').notNull(),
}, (table) => ({
  walletIdIdx: index('mint_wallet_id_idx').on(table.walletId),
  txHashIdx: index('mint_tx_hash_idx').on(table.transactionHash),
}));

export const pointBalances = pgTable('point_balances', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').references(() => wallets.id).notNull().unique(),
  walletAddress: text('wallet_address').notNull().unique(),
  starPoints: decimal('star_points', { precision: 20, scale: 2 }).default('0').notNull(),
  pointsEarnedFromMinting: decimal('points_earned_from_minting', { precision: 20, scale: 2 }).default('0').notNull(),
  pointsEarnedFromPlatform: decimal('points_earned_from_platform', { precision: 20, scale: 2 }).default('0').notNull(),
  pointsEarnedFromReferrals: decimal('points_earned_from_referrals', { precision: 20, scale: 2 }).default('0').notNull(),
  pointsEarnedFromTasks: decimal('points_earned_from_tasks', { precision: 20, scale: 2 }).default('0').notNull(),
  initialBonusReceived: boolean('initial_bonus_received').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  walletIdIdx: index('points_wallet_id_idx').on(table.walletId),
}));

export const referralLinks = pgTable('referral_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').references(() => wallets.id).notNull().unique(),
  walletAddress: text('wallet_address').notNull().unique(),
  referralCode: text('referral_code').notNull().unique(),
  totalReferrals: integer('total_referrals').default(0).notNull(),
  successfulReferrals: integer('successful_referrals').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  referralCodeIdx: index('referral_code_idx').on(table.referralCode),
}));

export const referralEvents = pgTable('referral_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerWalletId: uuid('referrer_wallet_id').references(() => wallets.id).notNull(),
  refereeWalletId: uuid('referee_wallet_id').references(() => wallets.id).notNull(),
  referralCode: text('referral_code').notNull(),
  ipAddress: text('ip_address'),
  deviceFingerprint: text('device_fingerprint'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: text('status').default('pending').notNull(),
  pointsAwarded: decimal('points_awarded', { precision: 20, scale: 2 }).default('0'),
}, (table) => ({
  referrerIdx: index('referrer_wallet_id_idx').on(table.referrerWalletId),
  refereeIdx: index('referee_wallet_id_idx').on(table.refereeWalletId),
  ipIdx: index('ip_address_idx').on(table.ipAddress),
}));

export const transactionRewards = pgTable('transaction_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').references(() => wallets.id).notNull(),
  walletAddress: text('wallet_address').notNull(),
  transactionHash: text('transaction_hash').notNull(),
  xlmSpent: decimal('xlm_spent', { precision: 20, scale: 7 }).notNull(),
  starPointsAwarded: decimal('star_points_awarded', { precision: 20, scale: 2 }).notNull(),
  transactionType: text('transaction_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  walletIdIdx: index('tx_rewards_wallet_id_idx').on(table.walletId),
  txHashIdx: uniqueIndex('tx_hash_idx').on(table.transactionHash),
}));

export const securityAuditLogs = pgTable('security_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletAddress: text('wallet_address'),
  ipAddress: text('ip_address'),
  deviceFingerprint: text('device_fingerprint'),
  action: text('action').notNull(),
  details: jsonb('details'),
  flagged: boolean('flagged').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  walletIdx: index('audit_wallet_idx').on(table.walletAddress),
  ipIdx: index('audit_ip_idx').on(table.ipAddress),
  flaggedIdx: index('audit_flagged_idx').on(table.flagged),
}));

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskType: text('task_type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  starReward: decimal('star_reward', { precision: 20, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  maxCompletions: integer('max_completions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taskCompletions = pgTable('task_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id).notNull(),
  walletId: uuid('wallet_id').references(() => wallets.id).notNull(),
  walletAddress: text('wallet_address').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
  pointsAwarded: decimal('points_awarded', { precision: 20, scale: 2 }).notNull(),
  proofData: jsonb('proof_data'),
}, (table) => ({
  taskWalletUnique: uniqueIndex('task_wallet_unique_idx').on(table.taskId, table.walletId),
  walletIdIdx: index('task_comp_wallet_idx').on(table.walletId),
}));

export const mintSettings = pgTable('mint_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  totalSupply: decimal('total_supply', { precision: 20, scale: 2 }).default('100000000').notNull(),
  pointHoldersAllocationPercent: decimal('point_holders_allocation_percent', { precision: 5, scale: 2 }).default('60').notNull(),
  listingReservePercent: decimal('listing_reserve_percent', { precision: 5, scale: 2 }).default('15').notNull(),
  teamPercent: decimal('team_percent', { precision: 5, scale: 2 }).default('15').notNull(),
  launchPercent: decimal('launch_percent', { precision: 5, scale: 2 }).default('5').notNull(),
  otherPercent: decimal('other_percent', { precision: 5, scale: 2 }).default('5').notNull(),
  mintingActive: boolean('minting_active').default(true).notNull(),
  treasuryWalletAddress: text('treasury_wallet_address'),
  totalXlmReceived: decimal('total_xlm_received', { precision: 20, scale: 7 }).default('0').notNull(),
  totalStarMinted: decimal('total_star_minted', { precision: 20, scale: 2 }).default('0').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userStats = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  totalUsers: integer('total_users').default(0).notNull(),
  usersWithInitialBonus: integer('users_with_initial_bonus').default(0).notNull(),
  totalStarDistributed: decimal('total_star_distributed', { precision: 20, scale: 2 }).default('0').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorWalletId: uuid('creator_wallet_id').references(() => wallets.id).notNull(),
  creatorWalletAddress: text('creator_wallet_address').notNull(),
  tokenName: text('token_name').notNull(),
  tokenSymbol: text('token_symbol').notNull(),
  totalSupply: decimal('total_supply', { precision: 20, scale: 7 }).notNull(),
  decimals: integer('decimals').default(7).notNull(),
  description: text('description').notNull(),
  logoUrl: text('logo_url'),
  airdropPercent: decimal('airdrop_percent', { precision: 5, scale: 2 }).notNull(),
  liquidityPercent: decimal('liquidity_percent', { precision: 5, scale: 2 }).notNull(),
  creatorPercent: decimal('creator_percent', { precision: 5, scale: 2 }).notNull(),
  initialLiquidityXLM: decimal('initial_liquidity_xlm', { precision: 20, scale: 7 }).notNull(),
  eventDurationDays: integer('event_duration_days').notNull(),
  eventStartDate: timestamp('event_start_date').notNull(),
  eventEndDate: timestamp('event_end_date').notNull(),
  status: text('status').default('active').notNull(),
  totalParticipations: integer('total_participations').default(0).notNull(),
  totalXlmContributed: decimal('total_xlm_contributed', { precision: 20, scale: 7 }).default('0').notNull(),
  totalStarDistributed: decimal('total_star_distributed', { precision: 20, scale: 2 }).default('0').notNull(),
  creatorStarEarned: decimal('creator_star_earned', { precision: 20, scale: 2 }).default('0').notNull(),
  tokenCreated: boolean('token_created').default(false).notNull(),
  tokenIssuer: text('token_issuer'),
  vestingEnabled: boolean('vesting_enabled').default(false).notNull(),
  vestingMonths: integer('vesting_months'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  creatorIdx: index('projects_creator_idx').on(table.creatorWalletId),
  statusIdx: index('projects_status_idx').on(table.status),
}));

export const projectParticipations = pgTable('project_participations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  participantWalletId: uuid('participant_wallet_id').references(() => wallets.id).notNull(),
  participantWalletAddress: text('participant_wallet_address').notNull(),
  xlmContributed: decimal('xlm_contributed', { precision: 20, scale: 7 }).notNull(),
  participantStarEarned: decimal('participant_star_earned', { precision: 20, scale: 2 }).notNull(),
  creatorStarEarned: decimal('creator_star_earned', { precision: 20, scale: 2 }).notNull(),
  transactionHash: text('transaction_hash').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  projectIdx: index('participations_project_idx').on(table.projectId),
  participantIdx: index('participations_participant_idx').on(table.participantWalletId),
  txHashIdx: index('participations_tx_hash_idx').on(table.transactionHash),
}));

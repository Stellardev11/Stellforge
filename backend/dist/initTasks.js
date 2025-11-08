"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDefaultTasks = initializeDefaultTasks;
const db_1 = require("./db");
const schema_1 = require("./db/schema");
async function initializeDefaultTasks() {
    try {
        const existingTasks = await db_1.db.select().from(schema_1.tasks);
        if (existingTasks.length === 0) {
            await db_1.db.insert(schema_1.tasks).values([
                {
                    taskType: 'social',
                    title: 'Follow StellForge on Twitter',
                    description: 'Follow our official Twitter account to stay updated',
                    pSlfReward: '25',
                    isActive: true,
                    maxCompletions: null,
                },
                {
                    taskType: 'social',
                    title: 'Join StellForge Discord',
                    description: 'Join our community Discord server',
                    pSlfReward: '25',
                    isActive: true,
                    maxCompletions: null,
                },
                {
                    taskType: 'platform',
                    title: 'Create Your First Token',
                    description: 'Launch a token on StellForge platform',
                    pSlfReward: '50',
                    isActive: true,
                    maxCompletions: null,
                },
                {
                    taskType: 'platform',
                    title: 'Add Liquidity',
                    description: 'Provide liquidity to any pool on StellForge',
                    pSlfReward: '30',
                    isActive: true,
                    maxCompletions: null,
                },
                {
                    taskType: 'platform',
                    title: 'Complete a Swap',
                    description: 'Perform your first token swap on StellForge',
                    pSlfReward: '20',
                    isActive: true,
                    maxCompletions: null,
                },
                {
                    taskType: 'referral',
                    title: 'Invite 5 Friends',
                    description: 'Share your referral link and get 5 friends to join',
                    pSlfReward: '100',
                    isActive: true,
                    maxCompletions: null,
                },
            ]);
            console.log('✓ Default tasks initialized');
        }
        const [existingSettings] = await db_1.db.select().from(schema_1.mintSettings);
        if (!existingSettings) {
            await db_1.db.insert(schema_1.mintSettings).values({
                totalSupply: '100000000',
                pointHoldersAllocationPercent: '60',
                listingReservePercent: '15',
                teamPercent: '15',
                launchPercent: '5',
                otherPercent: '5',
                mintingActive: true,
                totalXlmReceived: '0',
                totalPSlfMinted: '0',
            });
            console.log('✓ Mint settings initialized');
        }
    }
    catch (error) {
        console.error('Error initializing tasks:', error);
    }
}

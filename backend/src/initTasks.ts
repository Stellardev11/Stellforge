import { db } from './db';
import { tasks, mintSettings } from './db/schema';
import { eq } from 'drizzle-orm';

export async function initializeDefaultTasks() {
  try {
    const existingTasks = await db.select().from(tasks);
    
    if (existingTasks.length === 0) {
      await db.insert(tasks).values([
        {
          taskType: 'social',
          title: 'Follow StellForge on Twitter',
          description: 'Follow our official Twitter account to stay updated',
          starReward: '25',
          isActive: true,
          maxCompletions: null,
        },
        {
          taskType: 'social',
          title: 'Join StellForge Discord',
          description: 'Join our community Discord server',
          starReward: '25',
          isActive: true,
          maxCompletions: null,
        },
        {
          taskType: 'platform',
          title: 'Create Your First Token',
          description: 'Launch a token on StellForge platform',
          starReward: '50',
          isActive: true,
          maxCompletions: null,
        },
        {
          taskType: 'platform',
          title: 'Add Liquidity',
          description: 'Provide liquidity to any pool on StellForge',
          starReward: '30',
          isActive: true,
          maxCompletions: null,
        },
        {
          taskType: 'platform',
          title: 'Complete a Swap',
          description: 'Perform your first token swap on StellForge',
          starReward: '20',
          isActive: true,
          maxCompletions: null,
        },
        {
          taskType: 'referral',
          title: 'Invite 5 Friends',
          description: 'Share your referral link and get 5 friends to join',
          starReward: '100',
          isActive: true,
          maxCompletions: null,
        },
      ]);
      console.log('✓ Default tasks initialized');
    }

    const [existingSettings] = await db.select().from(mintSettings);
    if (!existingSettings) {
      await db.insert(mintSettings).values({
        totalSupply: '100000000',
        pointHoldersAllocationPercent: '60',
        listingReservePercent: '15',
        teamPercent: '15',
        launchPercent: '5',
        otherPercent: '5',
        mintingActive: true,
        totalXlmReceived: '0',
        totalStarMinted: '0',
      });
      console.log('✓ Mint settings initialized');
    }
  } catch (error) {
    console.error('Error initializing tasks:', error);
  }
}

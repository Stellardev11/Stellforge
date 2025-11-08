import express from 'express';

const router = express.Router();

router.get('/quests', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: [
        { id: 1, title: 'Create Your First Token', reward: 1000, completed: false },
        { id: 2, title: 'Stake 100 XLF', reward: 500, completed: false },
        { id: 3, title: 'Refer a Friend', reward: 750, completed: false }
      ]
    });
  } catch (error) {
    next(error);
  }
});

router.post('/spin', async (req, res, next) => {
  try {
    const rewards = [100, 250, 500, 1000, 5000];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    res.json({
      success: true,
      data: {
        reward: randomReward,
        message: `You won ${randomReward} XLF!`
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: [
        { rank: 1, address: 'GXXX...XXXX', score: 15000 },
        { rank: 2, address: 'GYYY...YYYY', score: 12500 },
        { rank: 3, address: 'GZZZ...ZZZZ', score: 10000 }
      ]
    });
  } catch (error) {
    next(error);
  }
});

export default router;
